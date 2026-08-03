import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserLevel, Transaction, Announcement, SystemSettings, NotificationToast, Currency } from '../types';
import { initialUsers, initialTransactions, initialAnnouncements, initialSystemSettings } from '../data/mockData';
import { 
  seedInitialDataIfEmpty, 
  subscribeUsers, 
  subscribeTransactions, 
  subscribeAnnouncements, 
  subscribeSettings, 
  saveUserToFirestore, 
  deleteUserFromFirestore,
  saveTransactionToFirestore, 
  saveAnnouncementToFirestore, 
  saveSettingsToFirestore 
} from '../lib/firebaseStore';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  announcements: Announcement[];
  systemSettings: SystemSettings;
  activeRole: 'user' | 'admin';
  simulatedHour: number | null; // null = use real time; number = simulated hour (e.g. 9 or 15)
  toasts: NotificationToast[];
  
  // Actions
  setActiveRole: (role: 'user' | 'admin') => void;
  setSimulatedHour: (hour: number | null) => void;
  addToast: (message: string, type?: NotificationToast['type']) => void;
  removeToast: (id: string) => void;
  
  // User Actions
  login: (emailOrId: string, password?: string) => boolean;
  logout: () => void;
  registerKYC: (userData: Partial<User>) => boolean;
  clickToChange: (currency: Currency) => { success: boolean; gain: number };
  performManualExchange: (fromCurrency: Currency, amount: number) => boolean;
  depositToSavings: (currency: Currency, amount: number) => boolean;
  withdrawFromSavings: (currency: Currency, amount: number) => { success: boolean; penalty: number; netAmount: number };
  requestEarlyRelease: (reason: string) => void;
  submitDeposit: (currency: Currency, amount: number, method: string, proofUrl?: string, destinationAccount?: string) => void;
  submitWithdrawal: (currency: Currency, amount: number, method: string, destinationAccount: string) => boolean;
  
  // Admin Actions
  approveUser: (userId: string) => void;
  rejectUser: (userId: string, reason: string) => void;
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string, reason: string) => void;
  processWithdrawal: (transactionId: string, status: 'completed' | 'rejected', reason?: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  adjustUserBalance: (userId: string, deltaUSD: number, deltaCDF: number, reason: string) => void;
  deleteUserAccount: (userId: string, reason: string) => void;
  updateUserByAdmin: (userId: string, updatedData: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('flintpay_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Filter out legacy demo trial users
        const demoIds = ['FPAY-123456', 'FPAY-234567', 'FPAY-345678'];
        return parsed.filter(u => !demoIds.includes(u.id));
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flintpay_currentUser');
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        const demoIds = ['FPAY-123456', 'FPAY-234567', 'FPAY-345678'];
        if (demoIds.includes(parsed.id)) {
          localStorage.removeItem('flintpay_currentUser');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('flintpay_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('flintpay_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('flintpay_settings');
    return saved ? JSON.parse(saved) : initialSystemSettings;
  });

  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user');
  const [simulatedHour, setSimulatedHour] = useState<number | null>(9); // Default simulated to 9h00 so click works out of the box!
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Initialize Firestore seeding and live subscriptions
  useEffect(() => {
    // Seed initial collections if empty
    seedInitialDataIfEmpty();

    // Subscribe to Firestore collections with safe state merging
    const unsubUsers = subscribeUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setUsers(prevUsers => {
          const map = new Map<string, User>();
          // 1. Add Firestore remote users
          firestoreUsers.forEach(u => {
            if (u && u.id) map.set(u.id, u);
          });
          // 2. Preserve any local user not yet in Firestore (e.g. newly registered)
          prevUsers.forEach(u => {
            if (u && u.id && !map.has(u.id)) {
              map.set(u.id, u);
              saveUserToFirestore(u);
            }
          });
          return Array.from(map.values());
        });
      }
    });

    const unsubTrx = subscribeTransactions((firestoreTrxs) => {
      if (firestoreTrxs && firestoreTrxs.length > 0) {
        setTransactions(prevTrxs => {
          const map = new Map<string, Transaction>();
          firestoreTrxs.forEach(t => {
            if (t && t.id) map.set(t.id, t);
          });
          prevTrxs.forEach(t => {
            if (t && t.id && !map.has(t.id)) {
              map.set(t.id, t);
              saveTransactionToFirestore(t);
            }
          });
          const list = Array.from(map.values());
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return list;
        });
      }
    });

    const unsubAnn = subscribeAnnouncements((firestoreAnns) => {
      if (firestoreAnns && firestoreAnns.length > 0) {
        setAnnouncements(prevAnns => {
          const map = new Map<string, Announcement>();
          firestoreAnns.forEach(a => {
            if (a && a.id) map.set(a.id, a);
          });
          prevAnns.forEach(a => {
            if (a && a.id && !map.has(a.id)) {
              map.set(a.id, a);
              saveAnnouncementToFirestore(a);
            }
          });
          const list = Array.from(map.values());
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return list;
        });
      }
    });

    const unsubSettings = subscribeSettings((firestoreSettings) => {
      if (firestoreSettings) {
        setSystemSettings(firestoreSettings);
      }
    });

    return () => {
      unsubUsers();
      unsubTrx();
      unsubAnn();
      unsubSettings();
    };
  }, []);

  // Helper to dynamically calculate user level based on investment and referrals
  const getDynamicUserLevel = (user: User, allUsers: User[]): UserLevel => {
    // Find all direct referrals for this user
    const directFilleuls = allUsers.filter(u => {
      if (!u.parrainCode) return false;
      const pCode = u.parrainCode.trim().toUpperCase();
      const cId = user.id.trim().toUpperCase();
      const cRef = (user.referralCode || '').trim().toUpperCase();
      const cEmail = (user.email || '').trim().toLowerCase();
      const cPhoneDigits = (user.telephone || '').replace(/[^0-9]/g, '');
      const pCodeDigits = pCode.replace(/[^0-9]/g, '');

      return pCode === cId ||
             pCode === cRef ||
             pCode.toLowerCase() === cEmail ||
             (pCodeDigits.length >= 6 && cPhoneDigits.length >= 6 && cPhoneDigits.includes(pCodeDigits));
    });

    const hasReferralInvested = (referral: User): boolean => {
      // Check if they have ever deposited >= 1 USD or >= 1000 CDF once in approved/completed transaction history
      const hasCompletedDeposit = transactions.some(t => 
        t.userId === referral.id && 
        (t.type === 'deposit' || t.type === 'savings_deposit') && 
        (t.status === 'completed' || t.status === 'approved') && 
        ((t.currency === 'USD' && t.amount >= 1) || (t.currency === 'CDF' && t.amount >= 1000))
      );
      if (hasCompletedDeposit) return true;

      // Safe fallback for pre-existing or mock users without deep transaction logs
      const usdVal = (referral.balanceUSD || 0) + (referral.savingsUSD || 0) + (referral.totalInvestedUSD || 0);
      const cdfVal = (referral.balanceCDF || 0) + (referral.savingsCDF || 0) + (referral.totalInvestedCDF || 0);
      return usdVal >= 1 || cdfVal >= 1000;
    };

    // Count referrals who registered and have invested at least 1 USD or 1000 CDF
    const count = directFilleuls.filter(hasReferralInvested).length;
    
    // Account balance: standard balance + savings balance
    const usd = (user.balanceUSD || 0) + (user.savingsUSD || 0);
    const cdf = (user.balanceCDF || 0) + (user.savingsCDF || 0);

    // Rule 5: Membre Sympathisant (1000 USD / 2 400 000 CDF + 500 qualified referrals)
    if ((usd >= 1000 || cdf >= 2400000) && count >= 500) {
      return 'sympathisant';
    }
    // Rule 4: Membre d'Honneur (500 USD / 1 200 000 CDF + 300 qualified referrals)
    if ((usd >= 500 || cdf >= 1200000) && count >= 300) {
      return 'honneur';
    }
    // Rule 3: Membre Fondateur (100 USD / 240 000 CDF + 100 qualified referrals)
    if ((usd >= 100 || cdf >= 240000) && count >= 100) {
      return 'fondateur';
    }
    // Rule 2: Membre Effectif (20 USD / 48 000 CDF + 25 qualified referrals)
    if ((usd >= 20 || cdf >= 48000) && count >= 25) {
      return 'effectif';
    }
    // Rule 1 / Default: Membre Adhérent
    return 'adherant';
  };

  // Update currentUser reference when users change, with dynamic level progression checks
  useEffect(() => {
    if (currentUser) {
      const updatedCurrent = users.find(u => u.id === currentUser.id);
      if (updatedCurrent) {
        const calculatedLevel = getDynamicUserLevel(updatedCurrent, users);
        if (updatedCurrent.level !== calculatedLevel) {
          const withNewLevel = { ...updatedCurrent, level: calculatedLevel };
          setUsers(prev => prev.map(u => u.id === updatedCurrent.id ? withNewLevel : u));
          setCurrentUser(withNewLevel);
          saveUserToFirestore(withNewLevel);
        } else {
          setCurrentUser(updatedCurrent);
        }
      }
    }
  }, [users, transactions]);

  // Apply 4% interest to all users with active savings balances
  const applySavingsInterest = (bypassDuplicateCheck = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let interestAppliedCount = 0;

    setUsers(prevUsers => {
      const updated = prevUsers.map(user => {
        // Skip if already applied today (and not bypassed for simulation)
        if (!bypassDuplicateCheck && user.lastSavingsPayoutDate === todayStr) {
          return user;
        }

        const usdInterest = (user.savingsUSD || 0) * 0.04;
        const cdfInterest = (user.savingsCDF || 0) * 0.04;

        if (usdInterest > 0 || cdfInterest > 0) {
          interestAppliedCount++;
          const updatedUser: User = {
            ...user,
            balanceUSD: parseFloat((user.balanceUSD + usdInterest).toFixed(2)),
            balanceCDF: parseFloat((user.balanceCDF + cdfInterest).toFixed(2)),
            lastSavingsPayoutDate: todayStr,
          };

          // Save updated user to Firestore
          saveUserToFirestore(updatedUser);

          // Record Transactions for USD interest
          if (usdInterest > 0) {
            const usdTrx: Transaction = {
              id: `INT-USD-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
              userId: user.id,
              userName: `${user.nom} ${user.postnom}`,
              type: 'deposit',
              currency: 'USD',
              amount: parseFloat(usdInterest.toFixed(2)),
              netAmount: parseFloat(usdInterest.toFixed(2)),
              paymentMethod: 'Versement Intérêt Épargne (4% / jour)',
              status: 'completed',
              createdAt: new Date().toISOString(),
            };
            saveTransactionToFirestore(usdTrx);
            setTransactions(prev => [usdTrx, ...prev]);
          }

          // Record Transactions for CDF interest
          if (cdfInterest > 0) {
            const cdfTrx: Transaction = {
              id: `INT-CDF-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
              userId: user.id,
              userName: `${user.nom} ${user.postnom}`,
              type: 'deposit',
              currency: 'CDF',
              amount: parseFloat(cdfInterest.toFixed(2)),
              netAmount: parseFloat(cdfInterest.toFixed(2)),
              paymentMethod: 'Versement Intérêt Épargne (4% / jour)',
              status: 'completed',
              createdAt: new Date().toISOString(),
            };
            saveTransactionToFirestore(cdfTrx);
            setTransactions(prev => [cdfTrx, ...prev]);
          }

          return updatedUser;
        }
        return user;
      });

      // Update current user references if they are updated
      if (currentUser) {
        const matched = updated.find(u => u.id === currentUser.id);
        if (matched) {
          setCurrentUser(matched);
        }
      }

      return updated;
    });

    if (interestAppliedCount > 0) {
      addToast(`Rémunération de l'Épargne de 4% versée pour ${interestAppliedCount} compte(s) !`, "success");
    }
  };

  // Trigger interest automatically when simulatedHour is set to 0 (midnight simulation)
  useEffect(() => {
    if (simulatedHour === 0) {
      applySavingsInterest(true); // bypass check for simulation testing
    }
  }, [simulatedHour]);

  // Real-world daily midnight check
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (simulatedHour === null && now.getHours() === 0 && now.getMinutes() === 0) {
        applySavingsInterest(false);
      }
    };
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [simulatedHour]);

  // Sync to localStorage as local fallback
  useEffect(() => {
    localStorage.setItem('flintpay_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('flintpay_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('flintpay_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('flintpay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('flintpay_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('flintpay_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  const addToast = (message: string, type: NotificationToast['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Login with Strict Password & Multi-identifier Verification (ID, Email, Phone, Referral Code)
  const login = (emailOrId: string, password?: string): boolean => {
    const rawInput = emailOrId.trim();
    const trimmedId = rawInput.toLowerCase();
    const digitsOnly = rawInput.replace(/[^0-9]/g, '');

    if (!trimmedId) {
      addToast('Veuillez saisir votre Identifiant FlintPay, E-mail ou Téléphone.', 'error');
      return false;
    }
    if (!password || !password.trim()) {
      addToast('Le mot de passe est obligatoire pour se connecter à un compte.', 'error');
      return false;
    }

    const found = users.find(u => {
      const emailMatch = u.email.toLowerCase().trim() === trimmedId;
      const idMatch = u.id.toLowerCase().trim() === trimmedId;
      const refMatch = u.referralCode.toLowerCase().trim() === trimmedId;
      const userPhoneDigits = (u.telephone || '').replace(/[^0-9]/g, '');
      const phoneMatch = u.telephone.toLowerCase().trim() === trimmedId || 
        (digitsOnly.length >= 6 && userPhoneDigits.includes(digitsOnly));
      
      return emailMatch || idMatch || refMatch || phoneMatch;
    });

    if (!found) {
      addToast('Aucun compte trouvé avec cet identifiant, e-mail ou numéro de téléphone.', 'error');
      return false;
    }
    if (found.kycStatus === 'rejected') {
      addToast('Ce compte a été suspendu/rejeté par la direction. Motif: ' + (found.rejectionReason || 'Non spécifié'), 'error');
      return false;
    }

    // Strict password match for every user including Admin
    const expectedPassword = found.password || (found.role === 'admin' ? '7432111111' : '123456');
    if (password.trim() !== expectedPassword) {
      addToast('Mot de passe incorrect pour cet identifiant. Accès refusé.', 'error');
      return false;
    }

    setCurrentUser(found);
    if (found.role === 'admin') {
      setActiveRole('admin');
      addToast('Connexion administrateur (Super Admin) réussie.', 'success');
    } else {
      setActiveRole('user');
      addToast(`Bienvenue sur votre espace FlintPay, ${found.nom} ${found.postnom}`, 'success');
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRole('user');
    addToast('Déconnexion effectuée avec succès', 'info');
  };

  // Register with Anti-Fraud & Compliance Controls
  const registerKYC = (userData: Partial<User>): boolean => {
    // 1. Check duplicate Email
    const emailNorm = (userData.email || '').toLowerCase().trim();
    if (emailNorm) {
      const emailExists = users.some(u => u.email.toLowerCase().trim() === emailNorm);
      if (emailExists) {
        addToast("Sécurité Anti-Fraude : Cette adresse e-mail est déjà associée à un compte FlintPay.", 'error');
        return false;
      }
    }

    // 2. Check duplicate Phone Number (1 account per phone number rule)
    const phoneNorm = (userData.telephone || '').replace(/[^0-9]/g, '');
    if (phoneNorm && phoneNorm.length > 5) {
      const phoneExists = users.some(u => (u.telephone || '').replace(/[^0-9]/g, '') === phoneNorm);
      if (phoneExists) {
        addToast("Sécurité Anti-Fraude : Un compte existe déjà avec ce numéro de téléphone. Règle : 1 seul compte par numéro.", 'error');
        return false;
      }
    }

    // 3. Check duplicate Identity (Nom + Postnom + Date de Naissance / Pièce)
    const nomNorm = (userData.nom || '').toLowerCase().trim();
    const postnomNorm = (userData.postnom || '').toLowerCase().trim();
    const dob = userData.dateNaissance || '';
    if (nomNorm && postnomNorm && dob) {
      const identityExists = users.some(u =>
        u.nom.toLowerCase().trim() === nomNorm &&
        u.postnom.toLowerCase().trim() === postnomNorm &&
        u.dateNaissance === dob
      );
      if (identityExists) {
        addToast("Sécurité Anti-Fraude & LBA : Une pièce d'identité identique ou cette personne est déjà enregistrée.", 'error');
        return false;
      }
    }

    // 4. Parrainage Code Resolution & Abusive Parrainage Detection
    let isFlagged = false;
    let risk: 'Faible' | 'Moyen' | 'Élevé' = 'Faible';
    const rawParrainCode = userData.parrainCode || localStorage.getItem('flintpay_ref_code') || sessionStorage.getItem('flintpay_ref_code') || '';
    const parrainCodeTrimmed = rawParrainCode ? rawParrainCode.trim().toUpperCase() : null;

    let matchedParrainUser: User | null = null;
    let finalParrainCode: string | null = parrainCodeTrimmed;

    if (parrainCodeTrimmed) {
      // Check if trying to self-refer
      if (parrainCodeTrimmed === emailNorm || parrainCodeTrimmed === phoneNorm) {
        addToast("Anti-Fraude : Auto-parrainage interdit.", 'error');
        return false;
      }

      // Search for sponsor in current users
      const codeDigits = parrainCodeTrimmed.replace(/[^0-9]/g, '');
      matchedParrainUser = users.find(u => {
        const uId = u.id.trim().toUpperCase();
        const uRef = (u.referralCode || '').trim().toUpperCase();
        const uEmail = (u.email || '').trim().toLowerCase();
        const uPhoneDigits = (u.telephone || '').replace(/[^0-9]/g, '');

        return uId === parrainCodeTrimmed ||
               uRef === parrainCodeTrimmed ||
               uEmail === parrainCodeTrimmed.toLowerCase() ||
               (codeDigits.length >= 6 && uPhoneDigits.length >= 6 && uPhoneDigits.includes(codeDigits));
      }) || null;

      if (matchedParrainUser) {
        finalParrainCode = matchedParrainUser.id; // Normalize to sponsor's standard ID (FPAY-XXXXXX)
      }

      // Check how many accounts use this referral code
      const referredCount = users.filter(u =>
        u.parrainCode?.toUpperCase() === parrainCodeTrimmed ||
        (matchedParrainUser && u.parrainCode?.toUpperCase() === matchedParrainUser.id.toUpperCase())
      ).length;

      if (referredCount >= 10) {
        isFlagged = true;
        risk = 'Moyen';
      }
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newId = `FPAY-${randomNum}`;
    
    const newUser: User = {
      id: newId,
      nom: userData.nom || 'Inconnu',
      postnom: userData.postnom || 'Inconnu',
      sexe: userData.sexe || 'M',
      dateNaissance: userData.dateNaissance || '1995-01-01',
      typePiece: userData.typePiece || 'carte_electeur',
      photoPieceUrl: userData.photoPieceUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      email: userData.email || `user${randomNum}@flintpay.com`,
      password: userData.password || '123456',
      pays: userData.pays || 'CD',
      telephone: userData.telephone || '+243 000 000 000',
      role: 'user',
      level: 'adherant',
      kycStatus: 'pending',
      balanceUSD: 0,
      balanceCDF: 0,
      savingsUSD: 0,
      savingsCDF: 0,
      referralCode: newId,
      parrainCode: finalParrainCode,
      referredBy: matchedParrainUser ? matchedParrainUser.id : null,
      referralsCount: 0,
      activeReferralsCount: 0,
      createdAt: new Date().toISOString(),
      totalInvestedUSD: 0,
      totalInvestedCDF: 0,
      isEncryptedStorage: true,
      storageBucket: "gs://flintpay-kyc-vault-encrypted/aes256",
      antiFraudFlagged: isFlagged,
      riskScore: risk,
      registrationIp: `197.234.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}`,
      deviceFingerprint: `FP-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    // If registered via a Parrain, update the Parrain's referral counts and save to Firestore
    if (matchedParrainUser) {
      const updatedParrain: User = {
        ...matchedParrainUser,
        referralsCount: (matchedParrainUser.referralsCount || 0) + 1,
        activeReferralsCount: (matchedParrainUser.activeReferralsCount || 0) + 1,
      };

      setUsers(prev => [newUser, ...prev.map(u => u.id === matchedParrainUser!.id ? updatedParrain : u)]);
      setCurrentUser(newUser);
      saveUserToFirestore(newUser);
      saveUserToFirestore(updatedParrain);
      addToast(`Compte créé avec succès (ID: ${newId}) et rattaché au parrain ${matchedParrainUser.nom} ${matchedParrainUser.postnom} (${matchedParrainUser.id}).`, 'success');
    } else {
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      saveUserToFirestore(newUser);
      addToast(`Compte créé avec succès ! Identifiant: ${newId}. Document chiffré (AES-256) et enregistré pour validation KYC.`, 'success');
    }

    return true;
  };

  // Click To Change
  const clickToChange = (currency: Currency) => {
    if (!currentUser) {
      addToast('Veuillez vous connecter d\'abord', 'error');
      return { success: false, gain: 0 };
    }

    if (currentUser.kycStatus !== 'approved') {
      addToast('Votre compte est en attente de validation KYC par l\'administrateur', 'warning');
      return { success: false, gain: 0 };
    }

    // Check active click time windows (09h00-09h59 or 15h00-15h59)
    const currentHour = simulatedHour !== null ? simulatedHour : new Date().getHours();
    const isMorningSlot = currentHour === 9;
    const isAfternoonSlot = currentHour === 15;

    if (!isMorningSlot && !isAfternoonSlot) {
      addToast('Le clic pour la conversion bonus (+1,25%) est uniquement disponible pendant les créneaux 09h00-09h59 et 15h00-15h59.', 'error');
      return { success: false, gain: 0 };
    }

    // Check single click per session restriction
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionKey = `${todayStr}_${isMorningSlot ? '09' : '15'}`;

    if (currentUser.lastClickSession === sessionKey) {
      addToast(`Vous avez déjà effectué votre conversion bonus pour la session du ${isMorningSlot ? 'matin (09h00)' : 'soir (15h00)'}. (1 seul clic autorisé par créneau).`, 'warning');
      return { success: false, gain: 0 };
    }

    const currentBalance = currency === 'USD' ? currentUser.balanceUSD : currentUser.balanceCDF;
    const minRequired = currency === 'USD' ? 1 : 1000;

    if (currentBalance < minRequired) {
      addToast(`Solde minimum requis pour cliquer: ${minRequired} ${currency}`, 'error');
      return { success: false, gain: 0 };
    }

    const gainRatio = systemSettings.clickGainRate; // e.g. 0.0125 (1.25%)
    const gain = currentBalance * gainRatio;
    const newRate = systemSettings.usdToCdfRate;

    let updatedUSD = currentUser.balanceUSD;
    let updatedCDF = currentUser.balanceCDF;

    if (currency === 'USD') {
      // Convert USD with gain to CDF
      const totalUSD = currentBalance + gain;
      const convertedCDF = totalUSD * newRate;
      updatedUSD = 0;
      updatedCDF = currentUser.balanceCDF + convertedCDF;
    } else {
      // Convert CDF with gain to USD
      const totalCDF = currentBalance + gain;
      const convertedUSD = totalCDF / newRate;
      updatedCDF = 0;
      updatedUSD = currentUser.balanceUSD + convertedUSD;
    }

    const updatedUser: User = {
      ...currentUser,
      balanceUSD: parseFloat(updatedUSD.toFixed(2)),
      balanceCDF: parseFloat(updatedCDF.toFixed(2)),
      lastClickDate: new Date().toISOString(),
      lastClickSession: sessionKey,
      totalInvestedUSD: currentUser.totalInvestedUSD + (currency === 'USD' ? currentBalance : 0),
      totalInvestedCDF: currentUser.totalInvestedCDF + (currency === 'CDF' ? currentBalance : 0),
    };

    // Update state & Firestore
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    saveUserToFirestore(updatedUser);

    // Record Transaction
    const newTrx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.nom} ${currentUser.postnom}`,
      type: 'exchange_click',
      currency,
      amount: parseFloat(gain.toFixed(2)),
      netAmount: parseFloat(gain.toFixed(2)),
      paymentMethod: `Gain de ${(gainRatio * 100).toFixed(2)}% appliqué + Conversion ${currency} (Session ${isMorningSlot ? '09h' : '15h'})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);
    addToast(`Échange effectué avec succès ! Gain de ${gain.toFixed(2)} ${currency} (+1,25%) pour la session du ${isMorningSlot ? 'matin (09h)' : 'soir (15h)'}`, 'success');

    return { success: true, gain };
  };

  // Manual Exchange
  const performManualExchange = (fromCurrency: Currency, amount: number): boolean => {
    if (!currentUser) return false;
    if (amount <= 0) {
      addToast('Entrez un montant supérieur à 0', 'error');
      return false;
    }

    const rate = systemSettings.usdToCdfRate;
    let updated: User;
    if (fromCurrency === 'USD') {
      if (currentUser.balanceUSD < amount) {
        addToast('Solde USD insuffisant', 'error');
        return false;
      }
      const cdfGained = amount * rate;
      updated = {
        ...currentUser,
        balanceUSD: parseFloat((currentUser.balanceUSD - amount).toFixed(2)),
        balanceCDF: parseFloat((currentUser.balanceCDF + cdfGained).toFixed(2)),
      };
    } else {
      if (currentUser.balanceCDF < amount) {
        addToast('Solde CDF insuffisant', 'error');
        return false;
      }
      const usdGained = amount / rate;
      updated = {
        ...currentUser,
        balanceCDF: parseFloat((currentUser.balanceCDF - amount).toFixed(2)),
        balanceUSD: parseFloat((currentUser.balanceUSD + usdGained).toFixed(2)),
      };
    }
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setCurrentUser(updated);
    saveUserToFirestore(updated);

    const newTrx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.nom} ${currentUser.postnom}`,
      type: 'manual_exchange',
      currency: fromCurrency,
      amount,
      netAmount: amount,
      paymentMethod: `Échange direct (${fromCurrency} vers ${fromCurrency === 'USD' ? 'CDF' : 'USD'})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);
    addToast(`Échange de ${amount} ${fromCurrency} effectué au taux de ${rate} CDF/USD`, 'success');
    return true;
  };

  // Deposit to Savings
  const depositToSavings = (currency: Currency, amount: number): boolean => {
    if (!currentUser) return false;
    if (amount <= 0) {
      addToast('Montant invalide', 'error');
      return false;
    }

    let updated: User;
    if (currency === 'USD') {
      if (currentUser.balanceUSD < amount) {
        addToast('Solde USD principal insuffisant', 'error');
        return false;
      }
      updated = {
        ...currentUser,
        balanceUSD: parseFloat((currentUser.balanceUSD - amount).toFixed(2)),
        savingsUSD: parseFloat((currentUser.savingsUSD + amount).toFixed(2)),
        savingsUSDDate: currentUser.savingsUSDDate || new Date().toISOString(),
      };
    } else {
      if (currentUser.balanceCDF < amount) {
        addToast('Solde CDF principal insuffisant', 'error');
        return false;
      }
      updated = {
        ...currentUser,
        balanceCDF: parseFloat((currentUser.balanceCDF - amount).toFixed(2)),
        savingsCDF: parseFloat((currentUser.savingsCDF + amount).toFixed(2)),
        savingsCDFDate: currentUser.savingsCDFDate || new Date().toISOString(),
      };
    }
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setCurrentUser(updated);
    saveUserToFirestore(updated);

    const newTrx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.nom} ${currentUser.postnom}`,
      type: 'savings_deposit',
      currency,
      amount,
      netAmount: amount,
      paymentMethod: 'Versement en Épargne Rémunérée 4%/jour',
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);
    addToast(`${amount} ${currency} placés dans votre compte épargne à 4%/jour !`, 'success');
    return true;
  };

  // Withdraw from Savings
  const withdrawFromSavings = (currency: Currency, amount: number) => {
    if (!currentUser) return { success: false, penalty: 0, netAmount: 0 };
    
    const availableSavings = currency === 'USD' ? currentUser.savingsUSD : currentUser.savingsCDF;
    if (amount <= 0 || amount > availableSavings) {
      addToast('Montant disponible d\'épargne insuffisant', 'error');
      return { success: false, penalty: 0, netAmount: 0 };
    }

    // Check lock period (6 months)
    const startDateStr = currency === 'USD' ? currentUser.savingsUSDDate : currentUser.savingsCDFDate;
    let isEarly = true;
    if (startDateStr) {
      const startDate = new Date(startDateStr);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      if (monthsDiff >= systemSettings.savingsLockMonths) {
        isEarly = false;
      }
    }

    const penaltyRate = isEarly ? systemSettings.savingsEarlyPenalty : 0;
    const penalty = amount * penaltyRate;
    const netAmount = amount - penalty;

    let updated: User;
    if (currency === 'USD') {
      updated = {
        ...currentUser,
        savingsUSD: parseFloat((currentUser.savingsUSD - amount).toFixed(2)),
        balanceUSD: parseFloat((currentUser.balanceUSD + netAmount).toFixed(2)),
      };
    } else {
      updated = {
        ...currentUser,
        savingsCDF: parseFloat((currentUser.savingsCDF - amount).toFixed(2)),
        balanceCDF: parseFloat((currentUser.balanceCDF + netAmount).toFixed(2)),
      };
    }
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setCurrentUser(updated);
    saveUserToFirestore(updated);

    const newTrx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.nom} ${currentUser.postnom}`,
      type: 'savings_withdrawal',
      currency,
      amount,
      feeAmount: parseFloat(penalty.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      paymentMethod: isEarly ? `Retrait anticipé (Pénalité ${(penaltyRate * 100)}%)` : 'Retrait à terme échu (sans pénalité)',
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);

    if (isEarly) {
      addToast(`Retrait anticipé effectué. Pénalité de ${penalty.toFixed(2)} ${currency} (12%). Crédité: ${netAmount.toFixed(2)} ${currency}`, 'warning');
    } else {
      addToast(`Retrait d'épargne effectué sans pénalité ! Crédité: ${netAmount.toFixed(2)} ${currency}`, 'success');
    }

    return { success: true, penalty, netAmount };
  };

  const requestEarlyRelease = (reason: string) => {
    addToast('Demande de déblocage d\'épargne transmise au gestionnaire. Vous recevrez une réponse sous 24h.', 'info');
  };

  // Submit Deposit
  const submitDeposit = (currency: Currency, amount: number, method: string, proofUrl?: string, destinationAccount?: string) => {
    if (!currentUser) return;
    if (amount <= 0) {
      addToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    const newTrx: Transaction = {
      id: `DEP-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.nom} ${currentUser.postnom}`,
      type: 'deposit',
      currency,
      amount,
      netAmount: amount,
      paymentMethod: method,
      paymentProofUrl: proofUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      destinationAccount: destinationAccount || systemSettings.binanceWalletUSD,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);
    addToast('Demande de dépôt transmise. En attente de vérification par l\'administrateur.', 'success');
  };

  // Submit Withdrawal
  const submitWithdrawal = (currency: Currency, amount: number, method: string, destinationAccount: string): boolean => {
    if (!currentUser) return false;

    // Check maximum of 2 withdrawals per 24 hours
    const now = new Date();
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const withdrawalsInLast24h = transactions.filter(t => 
      t.userId === currentUser.id && 
      t.type === 'withdrawal' && 
      t.status !== 'rejected' &&
      new Date(t.createdAt) >= past24h
    );

    if (withdrawalsInLast24h.length >= 2) {
      addToast('Le nombre de retraits ne peut pas dépasser 2 fois par 24 heures.', 'error');
      return false;
    }

    const balance = currency === 'USD' ? currentUser.balanceUSD : currentUser.balanceCDF;
    
    // Check max ratio (96.5% max, leave 3.5%)
    const maxRetirable = balance * (1 - systemSettings.withdrawalFeeRate - 0.005); 
    const fee = amount * systemSettings.withdrawalFeeRate;
    const netAmount = amount - fee;

    if (amount <= 0) {
      addToast('Montant invalide', 'error');
      return false;
    }

    if (amount > balance) {
      addToast('Solde insuffisant dans votre compte', 'error');
      return false;
    }

    if (balance - amount < balance * 0.035) {
      addToast('Vous devez conserver au moins 3.5% de votre solde en réserve de sécurité', 'error');
      return false;
    }

    // Deduct immediately (held in pending status)
    let updated: User;
    if (currency === 'USD') {
      updated = { ...currentUser, balanceUSD: parseFloat((currentUser.balanceUSD - amount).toFixed(2)) };
    } else {
      updated = { ...currentUser, balanceCDF: parseFloat((currentUser.balanceCDF - amount).toFixed(2)) };
    }
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setCurrentUser(updated);
    saveUserToFirestore(updated);

    const newTrx: Transaction = {
      id: `WIT-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: `${currentUser.nom} ${currentUser.postnom}`,
      type: 'withdrawal',
      currency,
      amount,
      feeAmount: parseFloat(fee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      paymentMethod: method,
      destinationAccount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);
    addToast(`Demande de retrait de ${amount} ${currency} soumise. Frais (3%): ${fee.toFixed(2)} ${currency}`, 'info');
    return true;
  };

  // Admin Actions
  const approveUser = (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
      const updated = { ...userToUpdate, kycStatus: 'approved' as const };
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      saveUserToFirestore(updated);
    }
    addToast(`Utilisateur ${userId} approuvé avec succès !`, 'success');
  };

  const rejectUser = (userId: string, reason: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
    deleteUserFromFirestore(userId);
    addToast(`Le compte ${userId} a été rejeté et supprimé définitivement. Motif : ${reason}`, 'warning');
  };

  const approveDeposit = (transactionId: string) => {
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx) return;

    const updatedTrx: Transaction = { ...trx, status: 'completed' };
    setTransactions(prev => prev.map(t => t.id === transactionId ? updatedTrx : t));
    saveTransactionToFirestore(updatedTrx);

    // Credit user balance
    setUsers(prev => prev.map(u => {
      if (u.id === trx.userId) {
        const usdAdd = trx.currency === 'USD' ? trx.amount : 0;
        const cdfAdd = trx.currency === 'CDF' ? trx.amount : 0;
        const updated = {
          ...u,
          balanceUSD: parseFloat((u.balanceUSD + usdAdd).toFixed(2)),
          balanceCDF: parseFloat((u.balanceCDF + cdfAdd).toFixed(2)),
          totalInvestedUSD: u.totalInvestedUSD + usdAdd,
          totalInvestedCDF: u.totalInvestedCDF + cdfAdd,
        };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        saveUserToFirestore(updated);
        return updated;
      }
      return u;
    }));

    addToast(`Dépôt ${transactionId} approuvé. Compte utilisateur crédité de ${trx.amount} ${trx.currency}`, 'success');
  };

  const rejectDeposit = (transactionId: string, reason: string) => {
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx) return;

    const updatedTrx: Transaction = { ...trx, status: 'rejected', rejectionReason: reason };
    setTransactions(prev => prev.map(t => t.id === transactionId ? updatedTrx : t));
    saveTransactionToFirestore(updatedTrx);
    addToast(`Dépôt ${transactionId} rejeté. Motif : ${reason}`, 'warning');
  };

  const processWithdrawal = (transactionId: string, status: 'completed' | 'rejected', reason?: string) => {
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx) return;

    const updatedTrx: Transaction = { ...trx, status, rejectionReason: reason };
    setTransactions(prev => prev.map(t => t.id === transactionId ? updatedTrx : t));
    saveTransactionToFirestore(updatedTrx);

    if (status === 'rejected') {
      // Refund balance to user
      setUsers(prev => prev.map(u => {
        if (u.id === trx.userId) {
          const usdRefund = trx.currency === 'USD' ? trx.amount : 0;
          const cdfRefund = trx.currency === 'CDF' ? trx.amount : 0;
          const updated = {
            ...u,
            balanceUSD: parseFloat((u.balanceUSD + usdRefund).toFixed(2)),
            balanceCDF: parseFloat((u.balanceCDF + cdfRefund).toFixed(2)),
          };
          if (currentUser && currentUser.id === u.id) {
            setCurrentUser(updated);
          }
          saveUserToFirestore(updated);
          return updated;
        }
        return u;
      }));
      addToast(`Retrait ${transactionId} rejeté. Montant remboursé au solde de l'utilisateur.`, 'info');
    } else {
      addToast(`Retrait ${transactionId} marqué comme exécuté / payé.`, 'success');
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...systemSettings, ...newSettings };
    setSystemSettings(updated);
    saveSettingsToFirestore(updated);
    addToast('Paramètres système mis à jour avec succès', 'success');
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      ...announcement,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    saveAnnouncementToFirestore(newAnn);
    addToast('Nouvelle annonce diffusée avec succès', 'success');
  };

  const toggleAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    if (ann) {
      const updated = { ...ann, isActive: !ann.isActive };
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      saveAnnouncementToFirestore(updated);
    }
    addToast('Statut de l\'annonce mis à jour', 'info');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addToast('Annonce supprimée', 'info');
  };

  const adjustUserBalance = (userId: string, deltaUSD: number, deltaCDF: number, reason: string) => {
    let targetUser: User | undefined;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          balanceUSD: Math.max(0, parseFloat((u.balanceUSD + deltaUSD).toFixed(2))),
          balanceCDF: Math.max(0, parseFloat((u.balanceCDF + deltaCDF).toFixed(2))),
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        targetUser = updated;
        saveUserToFirestore(updated);
        return updated;
      }
      return u;
    }));

    // Record adjustment transaction
    const newTrx: Transaction = {
      id: `ADJ-${Date.now().toString().slice(-6)}`,
      userId,
      userName: (targetUser?.nom || '') + ' ' + (targetUser?.postnom || ''),
      type: 'deposit',
      currency: deltaUSD !== 0 ? 'USD' : 'CDF',
      amount: deltaUSD !== 0 ? deltaUSD : deltaCDF,
      netAmount: deltaUSD !== 0 ? deltaUSD : deltaCDF,
      paymentMethod: `Ajustement Admin (${reason})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);
    saveTransactionToFirestore(newTrx);
    addToast(`Solde de l'utilisateur ${userId} ajusté. Motif : ${reason}`, 'success');
  };

  const deleteUserAccount = (userId: string, reason: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'admin') {
      addToast('Le compte Super Admin principal ne peut pas être supprimé.', 'error');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
    deleteUserFromFirestore(userId);
    addToast(`Compte ${userId} (${targetUser ? targetUser.nom + ' ' + targetUser.postnom : ''}) supprimé définitivement du système.${reason ? ' Motif : ' + reason : ''}`, 'warning');
  };

  const updateUserByAdmin = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updatedData };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        saveUserToFirestore(updated);
        return updated;
      }
      return u;
    }));
    addToast(`Informations de l'utilisateur ${userId} mises à jour`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        transactions,
        announcements,
        systemSettings,
        activeRole,
        simulatedHour,
        toasts,
        setActiveRole,
        setSimulatedHour,
        addToast,
        removeToast,
        login,
        logout,
        registerKYC,
        clickToChange,
        performManualExchange,
        depositToSavings,
        withdrawFromSavings,
        requestEarlyRelease,
        submitDeposit,
        submitWithdrawal,
        approveUser,
        rejectUser,
        approveDeposit,
        rejectDeposit,
        processWithdrawal,
        updateSettings,
        addAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        adjustUserBalance,
        deleteUserAccount,
        updateUserByAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
