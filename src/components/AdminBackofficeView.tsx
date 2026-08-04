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

