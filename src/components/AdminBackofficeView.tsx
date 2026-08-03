import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Transaction } from '../types';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Settings,
  Megaphone,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Coins,
  FileText,
  Eye,
  Search,
  AlertCircle,
  Users,
  GitFork,
  Check,
  X,
  Calendar,
  Phone,
  Mail,
  Globe,
  Award,
  Sparkles,
  PiggyBank,
  Wallet,
  Clock,
  ExternalLink,
  ChevronRight,
  Share2,
  Copy,
  Link,
  UserPlus,
  Edit3,
  EyeOff,
  Key,
  Lock
} from 'lucide-react';

export const AdminBackofficeView: React.FC = () => {
  const {
    users,
    transactions,
    announcements,
    systemSettings,
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
    addToast
  } = useApp();

  const [adminTab, setAdminTab] = useState<'kyc' | 'deposits' | 'withdrawals' | 'users' | 'settings' | 'announcements'>('kyc');

  // Modal states for action details
  const [rejectUserModalId, setRejectUserModalId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const [deleteUserModalId, setDeleteUserModalId] = useState<string | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState('');

  const [rejectDepositModalId, setRejectDepositModalId] = useState<string | null>(null);
  const [depositRejectReason, setDepositRejectReason] = useState('');

  const [viewProofModalUrl, setViewProofModalUrl] = useState<string | null>(null);

  // User Search & Account Overview Modal State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  // Password visibility state in Back-office
  const [showModalPassword, setShowModalPassword] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Referral Filter State
  const [userCategoryFilter, setUserCategoryFilter] = useState<'all' | 'referred' | 'direct' | 'active_referred'>('all');
  const [selectedParrainFilter, setSelectedParrainFilter] = useState<string>('all');

  // Assign / Change Parrain Modal State
  const [assignParrainUserId, setAssignParrainUserId] = useState<string | null>(null);
  const [newParrainInput, setNewParrainInput] = useState('');

  // Helper to copy user referral link
  const handleCopyUserReferralLink = (u: User) => {
    const link = `${window.location.origin}/register?ref=${u.id}`;
    navigator.clipboard.writeText(link);
    addToast(`Lien de parrainage de ${u.nom} ${u.postnom} (${u.id}) copié dans le presse-papier !`, 'info');
  };

  // Helper to determine if a user has invested (deposited or in savings) >= 1 USD or >= 1000 CDF
  const checkUserIsInvested = (targetUser: User) => {
    if ((targetUser.savingsUSD || 0) >= 1 || (targetUser.savingsCDF || 0) >= 1000) return true;
    if ((targetUser.balanceUSD || 0) >= 1 || (targetUser.balanceCDF || 0) >= 1000) return true;

    const userApprovedDeposits = transactions.filter(t =>
      t.userId === targetUser.id &&
      t.type === 'deposit' &&
      (t.status === 'approved' || t.status === 'completed')
    );

    const totalDepUSD = userApprovedDeposits
      .filter(t => t.currency === 'USD')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalDepCDF = userApprovedDeposits
      .filter(t => t.currency === 'CDF')
      .reduce((acc, t) => acc + t.amount, 0);

    return totalDepUSD >= 1 || totalDepCDF >= 1000;
  };

  // Helper to get referral stats for any user
  const getUserReferralsData = (targetUser: User) => {
    const filleuls = users.filter(u => {
      if (!u.parrainCode) return false;
      const pCode = u.parrainCode.trim().toUpperCase();
      const tId = targetUser.id.trim().toUpperCase();
      const tRef = (targetUser.referralCode || '').trim().toUpperCase();
      const tEmail = (targetUser.email || '').trim().toLowerCase();
      const tPhoneDigits = (targetUser.telephone || '').replace(/[^0-9]/g, '');
      const pCodeDigits = pCode.replace(/[^0-9]/g, '');

      return pCode === tId ||
             pCode === tRef ||
             pCode.toLowerCase() === tEmail ||
             (pCodeDigits.length >= 6 && tPhoneDigits.length >= 6 && tPhoneDigits.includes(pCodeDigits));
    });

    const activeFilleuls = filleuls.filter(f => checkUserIsInvested(f));
    const pendingKycFilleuls = filleuls.filter(f => f.kycStatus === 'pending');

    return {
      total: filleuls.length,
      active: activeFilleuls.length,
      pendingKyc: pendingKycFilleuls.length,
      filleulsList: filleuls,
    };
  };

  // Balance Adjust Modal State
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjUSD, setAdjUSD] = useState('');
  const [adjCDF, setAdjCDF] = useState('');
  const [adjReason, setAdjReason] = useState('');

  // Settings Form State
  const [rateInput, setRateInput] = useState(systemSettings.usdToCdfRate.toString());
  const [binanceInput, setBinanceInput] = useState(systemSettings.binanceWalletUSD);
  const [mobileInput, setMobileInput] = useState(systemSettings.mobileMoneyNumber);
  const [supportWhatsAppInput, setSupportWhatsAppInput] = useState(systemSettings.supportWhatsApp || '');
  const [supportTelegramInput, setSupportTelegramInput] = useState(systemSettings.supportTelegram || '');
  const [supportWhatsAppGroupInput, setSupportWhatsAppGroupInput] = useState(systemSettings.supportWhatsAppGroup || '');
  const [supportTelegramGroupInput, setSupportTelegramGroupInput] = useState(systemSettings.supportTelegramGroup || '');

  // Synchronize inputs when systemSettings loads/changes
  React.useEffect(() => {
    setRateInput(systemSettings.usdToCdfRate.toString());
    setBinanceInput(systemSettings.binanceWalletUSD);
    setMobileInput(systemSettings.mobileMoneyNumber);
    setSupportWhatsAppInput(systemSettings.supportWhatsApp || '');
    setSupportTelegramInput(systemSettings.supportTelegram || '');
    setSupportWhatsAppGroupInput(systemSettings.supportWhatsAppGroup || '');
    setSupportTelegramGroupInput(systemSettings.supportTelegramGroup || '');
  }, [systemSettings]);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'info' | 'promo' | 'warning'>('info');

  // Filter queues
  const pendingUsers = users.filter(u => u.kycStatus === 'pending');
  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const handleRejectUserSubmit = () => {
    if (!rejectUserModalId) return;
    if (!rejectReasonInput.trim()) {
      addToast('Précisez le motif du rejet', 'error');
      return;
    }
    rejectUser(rejectUserModalId, rejectReasonInput);
    setRejectUserModalId(null);
    setRejectReasonInput('');
  };

  const handleDeleteUserSubmit = () => {
    if (!deleteUserModalId) return;
    deleteUserAccount(deleteUserModalId, deleteReasonInput || 'Action d\'administration (Sécurité / Anti-Fraude)');
    setDeleteUserModalId(null);
    setDeleteReasonInput('');
  };

  const handleRejectDepositSubmit = () => {
    if (!rejectDepositModalId) return;
    if (!depositRejectReason.trim()) {
      addToast('Précisez le motif du rejet', 'error');
      return;
    }
    rejectDeposit(rejectDepositModalId, depositRejectReason);
    setRejectDepositModalId(null);
    setDepositRejectReason('');
  };

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUserId) return;
    const usdVal = parseFloat(adjUSD) || 0;
    const cdfVal = parseFloat(adjCDF) || 0;
    if (!adjReason.trim()) {
      addToast('Motif de l\'ajustement requis', 'error');
      return;
    }
    adjustUserBalance(adjustUserId, usdVal, cdfVal, adjReason);
    setAdjustUserId(null);
    setAdjUSD('');
    setAdjCDF('');
    setAdjReason('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(rateInput);
    if (!newRate || newRate <= 0) {
      addToast('Taux USD/CDF invalide', 'error');
      return;
    }
    updateSettings({
      usdToCdfRate: newRate,
      binanceWalletUSD: binanceInput,
      mobileMoneyNumber: mobileInput,
      supportWhatsApp: supportWhatsAppInput,
      supportTelegram: supportTelegramInput,
      supportWhatsAppGroup: supportWhatsAppGroupInput,
      supportTelegramGroup: supportTelegramGroupInput,
    });
  };

  const handleAddAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      addToast('Veuillez remplir le titre et le contenu de l\'annonce', 'error');
      return;
    }
    addAnnouncement({
      title: annTitle,
      content: annContent,
      type: annType,
      isActive: true,
    });
    setAnnTitle('');
    setAnnContent('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Espace Back-Office Manager / Super Admin
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">Gestion et Validation FlintPay</h1>
          <p className="text-xs text-slate-400 mt-1">
            Interface d'administration pour approuver les comptes KYC, vérifier les preuves de dépôt et gérer la plateforme.
          </p>
        </div>

        {/* Quick Pending Counter Badges */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="bg-slate-950 p-2 px-3 rounded-xl border border-slate-800 text-amber-400">
            KYC en attente : <span className="text-white font-mono">{pendingUsers.length}</span>
          </div>
          <div className="bg-slate-950 p-2 px-3 rounded-xl border border-slate-800 text-emerald-400">
            Dépôts en attente : <span className="text-white font-mono">{pendingDeposits.length}</span>
          </div>
          <div className="bg-slate-950 p-2 px-3 rounded-xl border border-slate-800 text-rose-400">
            Retraits en attente : <span className="text-white font-mono">{pendingWithdrawals.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setAdminTab('kyc')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'kyc' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Validation KYC ({pendingUsers.length})
        </button>

        <button
          onClick={() => setAdminTab('deposits')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'deposits' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          Dépôts ({pendingDeposits.length})
        </button>

        <button
          onClick={() => setAdminTab('withdrawals')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'withdrawals' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Retraits ({pendingWithdrawals.length})
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Tous les Comptes ({users.length})
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'settings' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Paramètres Système
        </button>

        <button
          onClick={() => setAdminTab('announcements')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'announcements' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Communiqués & Offres
        </button>
      </div>

      {/* TAB 1: KYC VALIDATION QUEUE */}
      {adminTab === 'kyc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100">Files d'Attente de Validation KYC</h2>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Aucune demande de création de compte KYC en attente de validation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map(user => (
                <div key={user.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-400 text-xs">{user.id}</span>
                      <h3 className="font-bold text-slate-100 text-sm">{user.nom} {user.postnom}</h3>
                      <p className="text-xs text-slate-400">{user.email} • {user.telephone}</p>
                    </div>
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                      Attente KYC
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div>Sexe: <span className="text-slate-200 font-semibold">{user.sexe}</span></div>
                    <div>Né(e) le: <span className="text-slate-200 font-semibold">{user.dateNaissance}</span></div>
                    <div>Pays: <span className="text-slate-200 font-semibold">{user.pays}</span></div>
                    <div>Pièce: <span className="text-slate-200 font-semibold uppercase">{user.typePiece}</span></div>
                  </div>

                  {/* Security & Anti-fraud badge */}
                  <div className="bg-slate-900/80 border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between text-[10.5px]">
                    <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Vault S3/GCS: AES-256 Chiffré
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${
                      user.antiFraudFlagged || user.riskScore === 'Élevé'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : user.riskScore === 'Moyen'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      Risque : {user.riskScore || 'Faible'}
                    </span>
                  </div>

                  {user.antiFraudFlagged && (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Alerte Anti-Fraude : Détection de parrainage multiple ou IP suspecte.</span>
                    </div>
                  )}

                  {/* Document Photo */}
                  <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <img
                      src={user.photoPieceUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                      alt="Piece KYC"
                      className="w-16 h-12 object-cover rounded border border-slate-700 cursor-pointer"
                      onClick={() => setViewProofModalUrl(user.photoPieceUrl || null)}
                    />
                    <button
                      onClick={() => setViewProofModalUrl(user.photoPieceUrl || null)}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Agrandir la pièce d'identité
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approuver le Compte
                    </button>
                    <button
                      onClick={() => setRejectUserModalId(user.id)}
                      className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-lg border border-rose-500/30 transition flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEPOSITS QUEUE */}
      {adminTab === 'deposits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100">Dépôts de Fonds en Attente de Vérification</h2>

          {pendingDeposits.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Aucun dépôt en attente d'approbation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDeposits.map(dep => (
                <div key={dep.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-400 text-xs">{dep.id}</span>
                      <h3 className="font-bold text-slate-100 text-sm">{dep.userName} ({dep.userId})</h3>
                      <p className="text-xs text-slate-400">Méthode: {dep.paymentMethod}</p>
                    </div>
                    <span className="text-base font-black font-mono text-emerald-400">
                      +{dep.amount} {dep.currency}
                    </span>
                  </div>

                  {/* Payment Proof Screenshot */}
                  <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <img
                      src={dep.paymentProofUrl}
                      alt="Preuve Dépôt"
                      className="w-16 h-12 object-cover rounded border border-slate-700 cursor-pointer"
                      onClick={() => setViewProofModalUrl(dep.paymentProofUrl || null)}
                    />
                    <button
                      onClick={() => setViewProofModalUrl(dep.paymentProofUrl || null)}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Voir la preuve de paiement
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => approveDeposit(dep.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approuver & Créditer Solde
                    </button>
                    <button
                      onClick={() => setRejectDepositModalId(dep.id)}
                      className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-lg border border-rose-500/30 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WITHDRAWALS QUEUE */}
      {adminTab === 'withdrawals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100">Demandes de Retrait en Attente de Traitement</h2>

          {pendingWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Aucune demande de retrait en attente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWithdrawals.map(wit => (
                <div key={wit.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-rose-400 text-xs">{wit.id}</span>
                      <h3 className="font-bold text-slate-100 text-sm">{wit.userName} ({wit.userId})</h3>
                      <p className="text-xs text-slate-400">Mode: {wit.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black font-mono text-slate-100">{wit.amount} {wit.currency}</p>
                      <p className="text-[10px] text-rose-400 font-mono font-semibold">Net à payer: {wit.netAmount} {wit.currency}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Compte / Portefeuille Destinataire</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">{wit.destinationAccount}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => processWithdrawal(wit.id, 'completed')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Marquer Payé / Exécuté
                    </button>
                    <button
                      onClick={() => processWithdrawal(wit.id, 'rejected', 'Paiement échoué ou destination invalide')}
                      className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-lg border border-rose-500/30 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeter & Rembourser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT & APERÇU DES COMPTES */}
      {adminTab === 'users' && (() => {
        // Calculate global referral metrics for Super Admin summary
        const usersWithParrain = users.filter(u => u.parrainCode);
        const totalReferralsGlobal = usersWithParrain.length;
        const totalActiveReferralsGlobal = usersWithParrain.filter(u => checkUserIsInvested(u)).length;
        const totalParrainsCount = new Set(usersWithParrain.map(u => u.parrainCode?.toUpperCase())).size;

        // Unique parrains for dropdown filter
        const uniqueParrainsList = users.filter(p => 
          users.some(u => u.parrainCode?.toUpperCase() === p.id.toUpperCase() || u.parrainCode?.toUpperCase() === p.referralCode.toUpperCase())
        );

        // Filter users
        const filteredUsersList = users.filter(u => {
          // Category filter
          if (userCategoryFilter === 'referred' && !u.parrainCode) return false;
          if (userCategoryFilter === 'direct' && u.parrainCode) return false;
          if (userCategoryFilter === 'active_referred' && (!u.parrainCode || !checkUserIsInvested(u))) return false;

          // Parrain specific filter
          if (selectedParrainFilter !== 'all') {
            const matchParrain = u.parrainCode?.toUpperCase() === selectedParrainFilter.toUpperCase();
            if (!matchParrain) return false;
          }

          // Search term filter
          if (userSearchTerm.trim()) {
            const term = userSearchTerm.toLowerCase();
            const parrainUser = u.parrainCode
              ? users.find(p => p.id.toUpperCase() === u.parrainCode?.toUpperCase() || p.referralCode.toUpperCase() === u.parrainCode?.toUpperCase())
              : null;
            const parrainName = parrainUser ? `${parrainUser.nom} ${parrainUser.postnom}`.toLowerCase() : '';

            return (
              u.id.toLowerCase().includes(term) ||
              u.nom.toLowerCase().includes(term) ||
              u.postnom.toLowerCase().includes(term) ||
              u.email.toLowerCase().includes(term) ||
              u.telephone.toLowerCase().includes(term) ||
              (u.parrainCode && u.parrainCode.toLowerCase().includes(term)) ||
              parrainName.includes(term)
            );
          }

          return true;
        });

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Gestion des Comptes Utilisateurs & Réseau de Parrainage
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisez tous les comptes inscrits (directs ou via lien de parrainage), leurs filleuls actifs, leurs parrains et effectuez les actions d'administration.
                </p>
              </div>

              {/* User Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ID, parrain..."
                  value={userSearchTerm}
                  onChange={e => setUserSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Super Admin Global Referral Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Comptes Inscrits</span>
                  <p className="text-xl font-black text-slate-100 font-mono mt-0.5">{users.length}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Parrains Actifs</span>
                  <p className="text-xl font-black text-sky-400 font-mono mt-0.5">{totalParrainsCount}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <GitFork className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Inscrits via Lien (Global)</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">{totalReferralsGlobal}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Filleuls Actifs (≥ $1 / 1000 FC)</span>
                  <p className="text-xl font-black text-teal-400 font-mono mt-0.5">{totalActiveReferralsGlobal}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Quick Category Sub-Filters & Parrain Selection Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <button
                  onClick={() => setUserCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    userCategoryFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>Tous les Comptes</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{users.length}</span>
                </button>

                <button
                  onClick={() => setUserCategoryFilter('referred')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    userCategoryFilter === 'referred'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Inscrits via Lien Parrain</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{totalReferralsGlobal}</span>
                </button>

                <button
                  onClick={() => setUserCategoryFilter('direct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    userCategoryFilter === 'direct'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>Inscriptions Directes</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{users.length - totalReferralsGlobal}</span>
                </button>

                <button
                  onClick={() => setUserCategoryFilter('active_referred')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    userCategoryFilter === 'active_referred'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Filleuls Actifs (Investis)</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{totalActiveReferralsGlobal}</span>
                </button>
              </div>

              {/* Filter by Specific Parrain Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-slate-400">Filtrer par Parrain:</span>
                <select
                  value={selectedParrainFilter}
                  onChange={e => setSelectedParrainFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">Tous les Parrains</option>
                  {uniqueParrainsList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} {p.postnom} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Compte & Identité</th>
                  <th className="py-3 px-3">Origine & Parrain</th>
                  <th className="py-3 px-3">Solde Disponible</th>
                  <th className="py-3 px-3">Épargne 4%/j</th>
                  <th className="py-3 px-3">Filleuls (Actifs / Total)</th>
                  <th className="py-3 px-3">Statut KYC & Rang</th>
                  <th className="py-3 px-3 text-right">Actions Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredUsersList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Aucun compte utilisateur ne correspond aux critères sélectionnés.
                    </td>
                  </tr>
                ) : (
                  filteredUsersList.map(u => {
                    const refData = getUserReferralsData(u);
                    const isInvested = checkUserIsInvested(u);

                    // Find Parrain User Name if exists
                    const parrainUser = u.parrainCode
                      ? users.find(p => p.id.toUpperCase() === u.parrainCode?.toUpperCase() || p.referralCode.toUpperCase() === u.parrainCode?.toUpperCase())
                      : null;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        
                        {/* ID & Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                              {u.nom.charAt(0)}{u.postnom.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-100">{u.nom} {u.postnom}</span>
                                {isInvested && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Investisseur Actif (Dépôt/Épargne ≥ 1$ / 1000 FC)" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[10.5px]">
                                <span className="font-bold text-emerald-400">{u.id}</span>
                                <span className="text-slate-500">| {u.telephone}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 font-mono text-[10.5px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md w-fit text-amber-300">
                                <Key className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="text-[10px] text-slate-400 font-sans">Pass:</span>
                                <span className="font-bold">
                                  {revealedPasswords[u.id] === false ? '••••••••' : (u.password || (u.role === 'admin' ? '7432111111' : '123456'))}
                                </span>
                                <button
                                  onClick={() => setRevealedPasswords(prev => ({ ...prev, [u.id]: prev[u.id] === false ? true : false }))}
                                  className="ml-1 text-slate-400 hover:text-amber-200 cursor-pointer"
                                  title={revealedPasswords[u.id] === false ? "Afficher le mot de passe" : "Masquer le mot de passe"}
                                >
                                  {revealedPasswords[u.id] === false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Parrain / Referral Origin */}
                        <td className="py-3 px-3">
                          {u.parrainCode ? (
                            <div className="space-y-0.5">
                              <div className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold text-sky-400">
                                <GitFork className="w-3 h-3" />
                                <span>Inscrit via Parrain</span>
                              </div>
                              <p className="font-mono text-xs font-bold text-slate-200 mt-1">
                                {u.parrainCode}
                              </p>
                              {parrainUser && (
                                <p className="text-[10.5px] text-slate-400">
                                  {parrainUser.nom} {parrainUser.postnom}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded text-[10.5px] italic">
                              Direct / Sans parrain
                            </span>
                          )}
                        </td>

                        {/* Liquid Balance */}
                        <td className="py-3 px-3 font-mono">
                          <p className="text-emerald-400 font-bold">${u.balanceUSD.toFixed(2)}</p>
                          <p className="text-teal-400 text-[11px]">{u.balanceCDF.toLocaleString('fr-FR')} FC</p>
                        </td>

                        {/* Savings Balance */}
                        <td className="py-3 px-3 font-mono">
                          <p className="text-amber-400 font-semibold">${(u.savingsUSD || 0).toFixed(2)}</p>
                          <p className="text-amber-300 text-[11px]">{(u.savingsCDF || 0).toLocaleString('fr-FR')} FC</p>
                        </td>

                        {/* Referral Counts: Active / Total & List of Referral Account IDs */}
                        <td className="py-3 px-3">
                          <div className="inline-flex flex-col space-y-1 max-w-[200px]">
                            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                              <span className="font-mono font-black text-emerald-400 text-xs">
                                {refData.active} Actif{refData.active > 1 ? 's' : ''}
                              </span>
                              <span className="text-slate-500 font-mono text-xs">/ {refData.total} Total</span>
                            </div>
                            
                            {/* Chip list of referral account IDs */}
                            {refData.total > 0 && (
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                <span className="text-[9.5px] font-sans font-semibold text-slate-400">IDs:</span>
                                {refData.filleulsList.map(filleul => (
                                  <span
                                    key={filleul.id}
                                    className="font-mono text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20"
                                    title={`Filleul: ${filleul.nom} ${filleul.postnom} (${filleul.telephone})`}
                                  >
                                    {filleul.id}
                                  </span>
                                ))}
                              </div>
                            )}

                            <span className="text-[9.5px] text-slate-500">
                              (Dépôt ≥ $1 USD ou 1000 FC)
                            </span>
                          </div>
                        </td>

                        {/* KYC & Level */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              u.kycStatus === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : u.kycStatus === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {u.kycStatus === 'approved' ? 'Validé' : u.kycStatus === 'pending' ? 'En attente' : 'Rejeté'}
                            </span>
                            <p className="text-[10px] text-slate-400 capitalize">{u.level}</p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedUserDetail(u)}
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold rounded-lg border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
                              title="Aperçu Complet des Informations du Compte"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Aperçu</span>
                            </button>

                            <button
                              onClick={() => handleCopyUserReferralLink(u)}
                              className="px-2 py-1.5 bg-sky-500/10 hover:bg-sky-600 text-sky-300 hover:text-white text-[11px] font-semibold rounded-lg border border-sky-500/30 transition flex items-center gap-1 cursor-pointer"
                              title="Copier le Lien de Parrainage de cet Utilisateur"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Lien</span>
                            </button>

                            <button
                              onClick={() => {
                                setAssignParrainUserId(u.id);
                                setNewParrainInput(u.parrainCode || '');
                              }}
                              className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold rounded-lg border border-indigo-500/30 transition flex items-center gap-1 cursor-pointer"
                              title="Attribuer ou Modifier le Code Parrain de ce Compte"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Parrain</span>
                            </button>

                            <button
                              onClick={() => {
                                setAdjustUserId(u.id);
                                setAdjUSD('0');
                                setAdjCDF('0');
                                setAdjReason('');
                              }}
                              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
                            >
                              Ajuster
                            </button>

                            {u.role !== 'admin' ? (
                              <button
                                onClick={() => {
                                  setDeleteUserModalId(u.id);
                                  setDeleteReasonInput('');
                                }}
                                className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-semibold rounded-lg border border-rose-500/30 transition flex items-center gap-1 cursor-pointer"
                                title="Supprimer définitivement le compte (Anti-Fraude)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}

      {/* TAB 5: SYSTEM SETTINGS */}
      {adminTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            Paramètres Généraux du Système
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taux Officiel du Jour (1 USD = X CDF)</label>
              <input
                type="number"
                step="any"
                required
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Portefeuille Binance BEP20 Officielle</label>
              <input
                type="text"
                required
                value={binanceInput}
                onChange={e => setBinanceInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Numéro Mobile Money Officiel</label>
              <input
                type="text"
                required
                value={mobileInput}
                onChange={e => setMobileInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Service Client & Liens de Communauté</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numéro WhatsApp de Support</label>
                  <input
                    type="text"
                    value={supportWhatsAppInput}
                    onChange={e => setSupportWhatsAppInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                    placeholder="Ex: +243 888 777 666"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Identifiant Telegram de Support</label>
                  <input
                    type="text"
                    value={supportTelegramInput}
                    onChange={e => setSupportTelegramInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                    placeholder="Ex: @FlintPaySupport"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lien du Groupe WhatsApp Officiel</label>
                  <input
                    type="text"
                    value={supportWhatsAppGroupInput}
                    onChange={e => setSupportWhatsAppGroupInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                    placeholder="Ex: https://chat.whatsapp.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lien du Canal / Communauté Telegram</label>
                  <input
                    type="text"
                    value={supportTelegramGroupInput}
                    onChange={e => setSupportTelegramGroupInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                    placeholder="Ex: https://t.me/..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Sauvegarder les Paramètres
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS MANAGER */}
      {adminTab === 'announcements' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            Gestion des Communiqués & Offres
          </h2>

          {/* Create Announcement Form */}
          <form onSubmit={handleAddAnnSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Publier un Nouveau Communiqué</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Titre de l'annonce..."
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={annType}
                  onChange={e => setAnnType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="info">Information</option>
                  <option value="promo">Promotion / Offre</option>
                  <option value="warning">Avertissement</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Contenu complet du communiqué..."
              value={annContent}
              onChange={e => setAnnContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
            />

            <button
              type="submit"
              className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Diffuser le Communiqué
            </button>
          </form>

          {/* List of Announcements */}
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-xs">{ann.title}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded uppercase text-slate-400">{ann.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{ann.content}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAnnouncement(ann.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                      ann.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {ann.isActive ? 'Actif' : 'Masqué'}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject User Reason Modal */}
      {rejectUserModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-rose-400">Rejeter et Supprimer le Compte {rejectUserModalId}</h3>
              <p className="text-xs text-rose-300/80 mt-1">
                Le rejet de la demande KYC entraînera la suppression définitive du compte de la base de données.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motif du Rejet *</label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Pièce d'identité illisible ou expirée..."
                value={rejectReasonInput}
                onChange={e => setRejectReasonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectUserModalId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleRejectUserSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Rejeter et Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Deposit Reason Modal */}
      {rejectDepositModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-400">Rejeter la Demande de Dépôt {rejectDepositModalId}</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motif du Rejet *</label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Capture non conforme ou paiement introuvable..."
                value={depositRejectReason}
                onChange={e => setDepositRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectDepositModalId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleRejectDepositSubmit}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Confirmer le Rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Proof Full Image Modal */}
      {viewProofModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4" onClick={() => setViewProofModalUrl(null)}>
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Aperçu du Document / Reçu de Paiement</span>
              <button onClick={() => setViewProofModalUrl(null)} className="text-xs text-slate-400 hover:text-white">Fermer</button>
            </div>
            <img src={viewProofModalUrl} alt="Aperçu Preuve" className="w-full max-h-[75vh] object-contain rounded-xl border border-slate-800" />
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {adjustUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleAdjustBalanceSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Ajuster le Solde de {adjustUserId}</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ajustement USD (+ ou -)</label>
                <input
                  type="number"
                  step="any"
                  value={adjUSD}
                  onChange={e => setAdjUSD(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ajustement CDF (+ ou -)</label>
                <input
                  type="number"
                  step="any"
                  value={adjCDF}
                  onChange={e => setAdjCDF(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motif de l'Ajustement *</label>
              <input
                type="text"
                required
                placeholder="Ex: Correction manuelle suite à dépôt physique..."
                value={adjReason}
                onChange={e => setAdjReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustUserId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Appliquer l'Ajustement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete User Account Permanent Modal */}
      {deleteUserModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Suppression Définitive du Compte</h3>
                <p className="text-xs text-rose-400 font-semibold">Action irréversible (Anti-Fraude)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vous êtes sur le point de supprimer définitivement le compte <strong className="text-slate-100 font-mono">{deleteUserModalId}</strong> du système FlintPay (base de données et état local). Toutes ses données et soldes seront supprimés.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motif de la suppression (Optionnel) :</label>
              <input
                type="text"
                placeholder="Ex: Fraude avérée, faux documents, usupation..."
                value={deleteReasonInput}
                onChange={e => setDeleteReasonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteUserModalId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold hover:bg-slate-700 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteUserSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE USER ACCOUNT DETAIL OVERVIEW MODAL (APERÇU DU COMPTE) */}
      {selectedUserDetail && (() => {
        const u = selectedUserDetail;
        const refData = getUserReferralsData(u);
        const isInvested = checkUserIsInvested(u);
        const parrainUser = u.parrainCode
          ? users.find(p => p.id.toUpperCase() === u.parrainCode?.toUpperCase() || p.referralCode.toUpperCase() === u.parrainCode?.toUpperCase())
          : null;

        const userApprovedDeposits = transactions.filter(t =>
          t.userId === u.id && t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed')
        );
        const totalDepUSD = userApprovedDeposits.filter(t => t.currency === 'USD').reduce((a, b) => a + b.amount, 0);
        const totalDepCDF = userApprovedDeposits.filter(t => t.currency === 'CDF').reduce((a, b) => a + b.amount, 0);

        const userCompletedWithdrawals = transactions.filter(t =>
          t.userId === u.id && t.type === 'withdrawal' && t.status === 'completed'
        );
        const totalWitUSD = userCompletedWithdrawals.filter(t => t.currency === 'USD').reduce((a, b) => a + b.amount, 0);
        const totalWitCDF = userCompletedWithdrawals.filter(t => t.currency === 'CDF').reduce((a, b) => a + b.amount, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setSelectedUserDetail(null)}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-lg border border-emerald-400/30">
                    {u.nom.charAt(0)}{u.postnom.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-100">{u.nom} {u.postnom}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        u.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        KYC {u.kycStatus === 'approved' ? 'Validé' : 'En Attente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 font-mono text-xs">
                      <span className="text-emerald-400 font-bold">ID: {u.id}</span>
                      <span className="text-slate-400">• Code Parrainage: {u.referralCode}</span>
                      <span className="text-amber-400 capitalize">• Rang: {u.level}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Identity & Account Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Profile Data Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Informations d'Identité & Contact
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">E-mail</span>
                      <span className="text-slate-200 font-medium">{u.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Téléphone</span>
                      <span className="text-slate-200 font-medium">{u.telephone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Sexe / Pays</span>
                      <span className="text-slate-200 font-medium">{u.sexe} ({u.pays})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Date de Naissance</span>
                      <span className="text-slate-200 font-medium">{u.dateNaissance || 'Non renseignée'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Type de Document Identity</span>
                      <span className="text-slate-200 font-medium uppercase">{u.idDocType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Date d'Inscription</span>
                      <span className="text-slate-200 font-medium">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Password & Security Credentials Box (Visible for Back-office Super Admin) */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                        <Key className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-amber-400/90 block text-[10px] font-bold uppercase tracking-wider">Mot de passe du Compte</span>
                        <span className="font-mono text-xs font-black text-amber-200">
                          {showModalPassword ? (u.password || (u.role === 'admin' ? '7432111111' : '123456')) : '••••••••••••'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title={showModalPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showModalPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{showModalPassword ? 'Masquer' : 'Afficher'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pass = u.password || (u.role === 'admin' ? '7432111111' : '123456');
                          navigator.clipboard.writeText(pass);
                          addToast(`Mot de passe de ${u.nom} copié dans le presse-papier !`, 'info');
                        }}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Copier le mot de passe"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </button>
                    </div>
                  </div>

                  {/* Parrain Line */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Rattaché au Parrain :</span>
                    {u.parrainCode ? (
                      <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {u.parrainCode} {parrainUser ? `(${parrainUser.nom})` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Aucun parrain (Inscription directe)</span>
                    )}
                  </div>
                </div>

                {/* Balances & Investments Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-teal-400" />
                    Aperçu des Soldes & Portefeuilles
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Solde Disponible USD</span>
                      <p className="text-lg font-black font-mono text-emerald-400 mt-0.5">${u.balanceUSD.toFixed(2)}</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Solde Disponible CDF</span>
                      <p className="text-lg font-black font-mono text-teal-400 mt-0.5">{u.balanceCDF.toLocaleString('fr-FR')} FC</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Épargne Remunérée USD</span>
                      <p className="text-base font-bold font-mono text-amber-400 mt-0.5">${(u.savingsUSD || 0).toFixed(2)}</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Épargne Remunérée CDF</span>
                      <p className="text-base font-bold font-mono text-amber-300 mt-0.5">{(u.savingsCDF || 0).toLocaleString('fr-FR')} FC</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Statut d'Investisseur :</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase border ${
                      isInvested ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isInvested ? '✓ Compte Investi (≥ $1 / 1000 FC)' : 'Non encore investi'}
                    </span>
                  </div>
                </div>

              </div>

              {/* REFERRAL NETWORK & ACTIVE FILLEULS STATS SECTION */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-emerald-400" />
                      Réseau de Parrainage & Filleuls Actifs (Ayant investi ≥ 1$ USD ou 1000 FC)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Les filleuls actifs sont les membres inscrits via ce parrain qui ont réalisé un dépôt ou placement égal ou supérieur à 1 USD ou 1000 CDF.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/20">
                      {refData.active} Filleuls Actifs
                    </span>
                    <span className="bg-slate-800 text-slate-300 font-mono text-xs font-bold px-3 py-1 rounded-xl border border-slate-700">
                      {refData.total} Total Filleuls
                    </span>
                  </div>
                </div>

                {/* Filleuls Table */}
                {refData.filleulsList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    Cet utilisateur n'a aucun filleul rattaché à son compte pour le moment.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-3">Membre Filleul</th>
                          <th className="py-2.5 px-3">ID Compte</th>
                          <th className="py-2.5 px-3">Inscription</th>
                          <th className="py-2.5 px-3">Statut KYC</th>
                          <th className="py-2.5 px-3 text-right">Statut Investissement (Actif)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {refData.filleulsList.map(filleul => {
                          const filleulIsInvested = checkUserIsInvested(filleul);
                          return (
                            <tr key={filleul.id} className="hover:bg-slate-900/60 transition">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-100">{filleul.nom} {filleul.postnom}</span>
                                <span className="text-[10px] text-slate-500 block">{filleul.telephone}</span>
                              </td>

                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                                {filleul.id}
                              </td>

                              <td className="py-2.5 px-3 font-mono text-slate-400">
                                {new Date(filleul.createdAt).toLocaleDateString('fr-FR')}
                              </td>

                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
                                  filleul.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {filleul.kycStatus === 'approved' ? 'Validé' : 'En attente'}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 text-right">
                                {filleulIsInvested ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    <Check className="w-3 h-3" />
                                    <span>Filleul Actif (≥ $1 / 1000 FC)</span>
                                  </span>
                                ) : (
                                  <span className="inline-block bg-slate-900 text-slate-500 border border-slate-800 px-2.5 py-1 rounded-full text-[10px]">
                                    Aucun investissement (Inactif)
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  {u.idProofUrl && (
                    <button
                      onClick={() => setViewProofModalUrl(u.idProofUrl || null)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Voir Document KYC</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setAdjustUserId(u.id);
                      setAdjUSD('0');
                      setAdjCDF('0');
                      setAdjReason('');
                      setSelectedUserDetail(null);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Ajuster Solde de ce Compte
                  </button>
                </div>

                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  Fermer la Fiche
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: ASSIGN / CHANGE PARRAIN CODE */}
      {assignParrainUserId && (() => {
        const targetUser = users.find(u => u.id === assignParrainUserId);
        if (!targetUser) return null;

        const currentParrain = targetUser.parrainCode
          ? users.find(p => p.id.toUpperCase() === targetUser.parrainCode?.toUpperCase() || p.referralCode.toUpperCase() === targetUser.parrainCode?.toUpperCase())
          : null;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <button
                onClick={() => { setAssignParrainUserId(null); setNewParrainInput(''); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Rattacher ou Modifier un Parrain</h3>
                  <p className="text-xs text-slate-400">
                    Compte : <strong className="text-slate-200">{targetUser.nom} {targetUser.postnom}</strong> ({targetUser.id})
                  </p>
                </div>
              </div>

              {currentParrain ? (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500 block text-[10.5px]">Parrain Actuel :</span>
                  <div className="flex items-center justify-between mt-1 font-mono font-bold">
                    <span className="text-sky-400">{targetUser.parrainCode}</span>
                    <span className="text-slate-300 font-sans font-normal">{currentParrain.nom} {currentParrain.postnom}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
                  Aucun parrain n'est rattaché à ce compte actuellement (Inscription directe).
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleanCode = newParrainInput.trim().toUpperCase();
                  updateUserByAdmin(targetUser.id, {
                    parrainCode: cleanCode || null
                  });
                  setAssignParrainUserId(null);
                  setNewParrainInput('');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nouveau Code Parrain (ID d'un utilisateur / Parrain)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: FPAY-100201"
                    value={newParrainInput}
                    onChange={e => setNewParrainInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Laissez vide pour retirer le parrain et basculer en inscription directe.
                  </p>
                </div>

                {/* Quick select existing parrain */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Ou sélectionner un Parrain de la liste :
                  </label>
                  <select
                    onChange={e => {
                      if (e.target.value) setNewParrainInput(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="" disabled>Choisir un parrain dans la plateforme...</option>
                    {users
                      .filter(u => u.id !== targetUser.id)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nom} {p.postnom} ({p.id})
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Enregistrer la Modification
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAssignParrainUserId(null); setNewParrainInput(''); }}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
