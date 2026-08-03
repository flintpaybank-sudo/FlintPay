import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  DollarSign,
  Coins,
  Copy,
  Check,
  MousePointerClick,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Users,
  ShieldAlert,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenSavings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenSavings,
}) => {
  const { currentUser, users, systemSettings, transactions, addToast } = useApp();
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Bienvenue sur FlintPay</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Connectez-vous à votre compte ou inscrivez-vous avec vos pièces d'identité (KYC) pour accéder aux deux portefeuilles USD/CDF, au clic d'incitation et à l'épargne.
        </p>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    addToast(`ID Compte ${currentUser.id} copié !`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const referralLink = `${window.location.origin}/register?ref=${currentUser.id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    addToast('Lien de parrainage copié dans le presse-papier !', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Last 10 transactions of current user
  const userTransactions = transactions
    .filter(t => t.userId === currentUser.id)
    .slice(0, 10);

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return { label: 'Dépôt', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ArrowDownLeft };
      case 'withdrawal':
        return { label: 'Retrait', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: ArrowUpRight };
      case 'exchange_click':
        return { label: 'Gain Clic (+1.25%)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: MousePointerClick };
      case 'savings_deposit':
        return { label: 'Placement Épargne', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: PiggyBank };
      case 'savings_withdrawal':
        return { label: 'Retrait Épargne', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: PiggyBank };
      default:
        return { label: 'Échange Manuel', bg: 'bg-slate-700/50 text-slate-300 border-slate-600', icon: Wallet };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* KYC Warning Banner if Pending */}
      {currentUser.kycStatus === 'pending' && (
        <div className="bg-amber-950/60 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-amber-300">Compte en cours de vérification KYC par le gestionnaire</h4>
            <p className="text-amber-200/80 mt-0.5">
              Votre pièce d'identité est actuellement examinée par l'administration FlintPay. Vous pouvez consulter l'application, mais les échanges et retraits seront débloqués dès validation.
            </p>
          </div>
        </div>
      )}

      {/* User Header & Info Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Tableau de Bord Personnel
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Actif
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              {currentUser.nom} {currentUser.postnom}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {/* Copy ID Button */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">ID Référence :</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{currentUser.id}</span>
                <button
                  onClick={handleCopyId}
                  title="Copier mon ID"
                  className="ml-1 text-slate-400 hover:text-emerald-400 transition"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Email / Phone */}
              <span className="text-xs text-slate-400 font-medium">{currentUser.telephone}</span>
            </div>
          </div>

          {/* Daily Exchange Rate Display Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:px-4 sm:py-3 flex items-center gap-3 self-start sm:self-auto shadow-inner">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Taux du Jour (Fixe)</p>
              <p className="font-mono font-black text-emerald-400 text-sm">1 USD = {systemSettings.usdToCdfRate} CDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wallets Grid (USD & CDF) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* USD Wallet Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 shadow-xl relative group transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Portefeuille USD</h3>
                <p className="text-[11px] text-slate-400">Dollars Américains</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              Principal
            </span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              ${currentUser.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Équivalent : <span className="font-mono text-emerald-400 font-semibold">{(currentUser.balanceUSD * systemSettings.usdToCdfRate).toLocaleString('fr-FR')} CDF</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('clic')}
              className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-1"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Convertir</span>
            </button>
            <button
              onClick={onOpenSavings}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
              <span>Épargner</span>
            </button>
            <button
              onClick={onOpenDeposit}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dépôt</span>
            </button>
            <button
              onClick={onOpenWithdrawal}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Retrait</span>
            </button>
          </div>
        </div>

        {/* CDF Wallet Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 shadow-xl relative group transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Portefeuille CDF</h3>
                <p className="text-[11px] text-slate-400">Francs Congolais</p>
              </div>
            </div>
            <span className="bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/20 uppercase">
              National
            </span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {currentUser.balanceCDF.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FC
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Équivalent : <span className="font-mono text-teal-400 font-semibold">${(currentUser.balanceCDF / systemSettings.usdToCdfRate).toFixed(2)} USD</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('clic')}
              className="py-2 px-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-1"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Convertir</span>
            </button>
            <button
              onClick={onOpenSavings}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
              <span>Épargner</span>
            </button>
            <button
              onClick={onOpenDeposit}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dépôt</span>
            </button>
            <button
              onClick={onOpenWithdrawal}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Retrait</span>
            </button>
          </div>
        </div>

      </div>

      {/* Savings & Referral Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Savings Balance Quick Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compte Épargne Rémunérée</h4>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                  4% / jour
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono text-sm font-bold text-slate-100">
                <span>${currentUser.savingsUSD.toFixed(2)} USD</span>
                <span className="text-slate-600">•</span>
                <span>{currentUser.savingsCDF.toLocaleString('fr-FR')} CDF</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('savings')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-xl transition"
            title="Gérer mon épargne"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Referral Link & Stats Card */}
        {(() => {
          const myFilleuls = users.filter(u => {
            if (!u.parrainCode) return false;
            const pCode = u.parrainCode.trim().toUpperCase();
            const cId = currentUser.id.trim().toUpperCase();
            const cRef = (currentUser.referralCode || '').trim().toUpperCase();
            const cEmail = (currentUser.email || '').trim().toLowerCase();
            const cPhoneDigits = (currentUser.telephone || '').replace(/[^0-9]/g, '');
            const pCodeDigits = pCode.replace(/[^0-9]/g, '');

            return pCode === cId ||
                   pCode === cRef ||
                   pCode.toLowerCase() === cEmail ||
                   (pCodeDigits.length >= 6 && cPhoneDigits.length >= 6 && cPhoneDigits.includes(pCodeDigits));
          });
          const displayCount = myFilleuls.length;
          const activeCount = myFilleuls.filter(f => f.kycStatus === 'approved').length;

          // Next level calculations based on referral requirements
          const getNextLevelInfo = (count: number) => {
            if (count < 25) return { name: 'Membre Effectif', target: 25, current: count, pct: Math.min(100, Math.round((count / 25) * 100)) };
            if (count < 100) return { name: 'Membre Fondateur', target: 100, current: count, pct: Math.min(100, Math.round((count / 100) * 100)) };
            if (count < 300) return { name: 'Membre d\'Honneur', target: 300, current: count, pct: Math.min(100, Math.round((count / 300) * 100)) };
            return { name: 'Membre Sympathisant', target: 500, current: count, pct: Math.min(100, Math.round((count / 500) * 100)) };
          };
          const levelProgress = getNextLevelInfo(displayCount);

          // Anonymization helper functions
          const anonymizeName = (nom: string, postnom: string) => {
            const firstLetter = nom.charAt(0);
            const postInit = postnom.charAt(0);
            return `${firstLetter}*** ${postInit}.`;
          };

          const anonymizeId = (id: string) => {
            const parts = id.split('-');
            if (parts.length === 2) {
              return `${parts[0]}-***${parts[1].slice(-3)}`;
            }
            return id.slice(0, 4) + '...';
          };

          return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mon Réseau Parrainage</h4>
                    <p className="text-[10.5px] text-emerald-400 font-semibold mt-0.5">
                      Filleuls inscrits : {displayCount} ({activeCount} actifs)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Détails</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Level Progress Bar */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-300">Niveau : <strong className="capitalize text-slate-100">{currentUser.level}</strong></span>
                  <span className="text-amber-400 font-mono font-bold">Objectif : {levelProgress.name} ({levelProgress.current}/{levelProgress.target})</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress.pct}%` }}
                  />
                </div>
                {levelProgress.target > levelProgress.current ? (
                  <p className="text-[9.5px] text-slate-400">
                    Plus que {levelProgress.target - levelProgress.current} filleul{levelProgress.target - levelProgress.current !== 1 ? 's' : ''} pour passer au niveau {levelProgress.name}.
                  </p>
                ) : (
                  <p className="text-[9.5px] text-emerald-400 font-semibold">Niveau Maximum Atteint !</p>
                )}
              </div>

              {/* Anonymized Referral Mini List */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mes Filleuls Récents</span>
                {myFilleuls.length === 0 ? (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center text-[11px] text-slate-500">
                    Aucun filleul inscrit pour le moment.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1">
                    {myFilleuls.slice(0, 3).map(f => {
                      const isInvested = f.totalInvestedUSD > 0 || f.totalInvestedCDF > 0 || f.balanceUSD > 0 || f.balanceCDF > 0;
                      return (
                        <div key={f.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between text-xs hover:border-slate-700 transition">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 font-mono text-[11px]">{anonymizeName(f.nom, f.postnom)} ({anonymizeId(f.id)})</p>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Inscrit le {new Date(f.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                              f.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {f.kycStatus === 'approved' ? 'Validé' : 'En Attente'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                              isInvested ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isInvested ? 'Investisseur' : 'Non Investi'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copié' : 'Partager'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Voir l'Arbre Graphique"
                >
                  <span>Arbre</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </button>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Recent Transactions Section (Last 10) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Dernières Transactions</h3>
            <p className="text-xs text-slate-400">Historique des 10 plus récentes opérations</p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
          >
            <span>Voir tout l'historique</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {userTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Aucune transaction enregistrée pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date & Heure</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Montant</th>
                  <th className="py-3 px-3">Méthode / Détails</th>
                  <th className="py-3 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {userTransactions.map((trx) => {
                  const badge = getTransactionBadge(trx.type);
                  const Icon = badge.icon;
                  const isPositive = trx.type === 'deposit' || trx.type === 'exchange_click' || trx.type === 'savings_withdrawal';

                  return (
                    <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(trx.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${badge.bg}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-100 whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-400' : 'text-slate-200'}>
                          {isPositive ? '+' : ''}{trx.amount} {trx.currency}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                        {trx.paymentMethod || 'Opération système'}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(trx.status)}`}>
                          {trx.status === 'completed' ? 'Validé' : trx.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
