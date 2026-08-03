import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Share2,
  Copy,
  Check,
  Award,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  GitFork,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Mail,
  Send,
  Info,
  ChevronRight,
  Clock,
  User
} from 'lucide-react';

export const ReferralNetworkView: React.FC = () => {
  const { currentUser, users, transactions, addToast } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-400 text-sm">Veuillez vous connecter pour voir votre réseau de parrainage.</p>
      </div>
    );
  }

  // Find all direct referrals for current user
  const directFilleuls = users.filter(u => {
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

  const activeFilleulsCount = directFilleuls.filter(f => f.kycStatus === 'approved').length;
  const pendingFilleulsCount = directFilleuls.filter(f => f.kycStatus === 'pending').length;
  const totalFilleulsCount = directFilleuls.length;

  const conversionRate = totalFilleulsCount > 0 ? Math.round((activeFilleulsCount / totalFilleulsCount) * 100) : 0;

  const filteredFilleuls = directFilleuls.filter(f => {
    if (statusFilter === 'approved') return f.kycStatus === 'approved';
    if (statusFilter === 'pending') return f.kycStatus === 'pending';
    return true;
  });

  const referralLink = `${window.location.origin}/?ref=${currentUser.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    addToast('Lien de parrainage copié dans le presse-papier !', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    addToast(`ID Code ${currentUser.id} copié !`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const shareText = encodeURIComponent(
    `Rejoins FlintPay avec mon lien de parrainage ! Échange USD/CDF instantané & épargne rémunérée à 4%/jour. Mon ID: ${currentUser.id}\n${referralLink}`
  );

  const whatsappUrl = `https://wa.me/?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Rejoins FlintPay avec mon code ${currentUser.id}`)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent("Invitation FlintPay")}&body=${shareText}`;

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'adherant': return 'Membre Adhérent (ou Membre Usager)';
      case 'effectif': return 'Membre Effectif (ou Membre Associé / Sociétaire)';
      case 'fondateur': return 'Membre Fondateur (ou Membre Promoteur)';
      case 'honneur': return 'Membre d\'Honneur (ou Membre Honoraire)';
      case 'sympathisant': return 'Membre Sympathisant (ou Membre Passif)';
      default: return lvl;
    }
  };

  const getNextLevelRequirements = () => {
    const hasReferralInvested = (referral: typeof currentUser) => {
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
    const count = directFilleuls.filter(hasReferralInvested).length;
    const usd = (currentUser.balanceUSD || 0) + (currentUser.savingsUSD || 0);
    const cdf = (currentUser.balanceCDF || 0) + (currentUser.savingsCDF || 0);

    let nextName = '';
    let reqBalanceUSD = 0;
    let reqBalanceCDF = 0;
    let reqReferrals = 0;

    if (currentUser.level === 'adherant') {
      nextName = 'Membre Effectif';
      reqBalanceUSD = 20;
      reqBalanceCDF = 48000;
      reqReferrals = 25;
    } else if (currentUser.level === 'effectif') {
      nextName = 'Membre Fondateur';
      reqBalanceUSD = 100;
      reqBalanceCDF = 240000;
      reqReferrals = 100;
    } else if (currentUser.level === 'fondateur') {
      nextName = 'Membre d\'Honneur';
      reqBalanceUSD = 500;
      reqBalanceCDF = 1200000;
      reqReferrals = 300;
    } else if (currentUser.level === 'honneur') {
      nextName = 'Membre Sympathisant';
      reqBalanceUSD = 1000;
      reqBalanceCDF = 2400000;
      reqReferrals = 500;
    } else {
      return null;
    }

    const hasBalance = usd >= reqBalanceUSD || cdf >= reqBalanceCDF;
    const hasReferrals = count >= reqReferrals;

    const balancePct = Math.min(100, Math.round((Math.max(usd / reqBalanceUSD, cdf / reqBalanceCDF)) * 100));
    const referralsPct = Math.min(100, Math.round((count / reqReferrals) * 100));
    const overallPct = Math.round((balancePct + referralsPct) / 2);

    return {
      nextName,
      reqBalanceUSD,
      reqBalanceCDF,
      reqReferrals,
      currentBalanceUSD: usd,
      currentBalanceCDF: cdf,
      currentReferrals: count,
      hasBalance,
      hasReferrals,
      balancePct,
      referralsPct,
      overallPct
    };
  };

  const levelProgress = getNextLevelRequirements();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Network Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <GitFork className="w-3.5 h-3.5" />
              <span>Programme d'Affiliation & Réseau FlintPay</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              Mon Réseau de Filleuls
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1 leading-relaxed">
              Invitez de nouveaux membres grâce à votre lien unique. Dès qu'un utilisateur s'inscrit via votre lien, il est automatiquement rattaché à votre réseau en tant que filleul.
            </p>
          </div>

          {/* User Code & Quick Copy */}
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 shrink-0 shadow-inner flex flex-col gap-2.5">
            <div className="text-xs">
              <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider">Mon Code Parrain Officiel</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-base font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                  {currentUser.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl border border-slate-700 transition"
                  title="Copier mon code"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link & Social Sharing Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Votre Lien Direct de Parrainage</h3>
          </div>
          <span className="text-xs text-slate-400">
            Attribution automatique dès l'ouverture de la page d'inscription
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full sm:flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono focus:outline-none shadow-inner"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Lien Copié !' : 'Copier le Lien'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition flex items-center justify-center"
              title="Partager sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl transition flex items-center justify-center"
              title="Partager sur Telegram"
            >
              <Send className="w-4 h-4" />
            </a>

            <a
              href={mailUrl}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition flex items-center justify-center"
              title="Partager par E-mail"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Key Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Filleuls</span>
            <p className="text-2xl font-black text-slate-100 font-mono mt-0.5">{totalFilleulsCount}</p>
            <span className="text-[10px] text-emerald-400">Rattachés directement</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Filleuls KYC Validés</span>
            <p className="text-2xl font-black text-slate-100 font-mono mt-0.5">{activeFilleulsCount}</p>
            <span className="text-[10px] text-teal-400">Membres Actifs</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">En Attente KYC</span>
            <p className="text-2xl font-black text-slate-100 font-mono mt-0.5">{pendingFilleulsCount}</p>
            <span className="text-[10px] text-amber-400">En cours de vérification</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Taux de Conversion</span>
            <p className="text-2xl font-black text-slate-100 font-mono mt-0.5">{conversionRate}%</p>
            <span className="text-[10px] text-indigo-400">Actifs / Total</span>
          </div>
        </div>

      </div>

      {/* PROMINENT SUMMARY CARD: LIST OF REFERRAL ACCOUNT IDs FOR MAIN SPONSOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Liste des Identifiants (IDs) de vos {totalFilleulsCount} Filleul{totalFilleulsCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-xs text-slate-400">
                Identifiants de compte rattachés à votre code parrain principal <span className="font-mono text-emerald-400 font-bold">{currentUser.id}</span>
              </p>
            </div>
          </div>

          <span className="bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
            {totalFilleulsCount} Compte{totalFilleulsCount !== 1 ? 's' : ''} Filleul{totalFilleulsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {directFilleuls.length === 0 ? (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-center text-xs text-slate-400">
            Aucun compte filleul rattaché pour le moment. Transmettez votre ID <strong className="text-emerald-400 font-mono">{currentUser.id}</strong> à vos filleuls lors de leur inscription.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {directFilleuls.map(filleul => (
              <div
                key={filleul.id}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                    {filleul.nom.charAt(0)}{filleul.postnom.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-emerald-400 truncate">{filleul.id}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${filleul.kycStatus === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'}`} title={filleul.kycStatus === 'approved' ? 'KYC Validé' : 'KYC En Attente'} />
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium truncate">{filleul.nom} {filleul.postnom}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(filleul.id);
                    addToast(`ID Filleul ${filleul.id} copié !`, 'info');
                  }}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition shrink-0 cursor-pointer"
                  title="Copier l'ID de ce filleul"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Progression Bar Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Progression vers le Prochain Niveau de Membre</h3>
          </div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Niveau Actuel : {getLevelLabel(currentUser.level)}
          </span>
        </div>

        {!levelProgress ? (
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 text-center font-bold">
            🎉 Félicitations ! Vous avez atteint le niveau maximal : {getLevelLabel('sympathisant')}.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Pour passer au niveau <span className="font-bold text-slate-200">{levelProgress.nextName}</span>, vous devez remplir simultanément deux conditions :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Condition 1: Balance */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">1. Solde du compte (Standard + Épargne)</span>
                  <span className={`font-bold ${levelProgress.hasBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {levelProgress.hasBalance ? 'Validé' : 'En cours'}
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress.balancePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Requis : {levelProgress.reqBalanceUSD} USD ou {levelProgress.reqBalanceCDF.toLocaleString('fr-FR')} FC</span>
                  <span>Actuel : {levelProgress.currentBalanceUSD.toFixed(2)} USD / {levelProgress.currentBalanceCDF.toLocaleString('fr-FR')} FC</span>
                </div>
              </div>

              {/* Condition 2: Referrals */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">2. Filleuls qualifiés (Inscrits & Épargnés)</span>
                  <span className={`font-bold ${levelProgress.hasReferrals ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {levelProgress.currentReferrals} / {levelProgress.reqReferrals} {levelProgress.hasReferrals ? 'Validé' : 'En cours'}
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress.referralsPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Requis : +{levelProgress.reqReferrals} filleuls investis (≥1$ / 1000 FC)</span>
                  <span>Actuel : {levelProgress.currentReferrals} filleuls qualifiés</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 text-center">
              Un filleul est compté comme actif s'il a déjà effectué au moins un dépôt approuvé supérieur ou égal à <span className="font-bold text-slate-200">1 USD ou 1000 CDF</span>.
            </div>
          </div>
        )}
      </div>

      {/* GRAPHICAL NETWORK TREE SECTION ("Arbre de Parrainage Graphique") */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-400" />
              Arbre Graphique du Réseau (Visualisateur Interactif)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Représentation visuelle en arbre de votre position de Parrain et de vos Filleuls rattachés.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            {totalFilleulsCount} Branche{totalFilleulsCount > 1 ? 's' : ''} Active{totalFilleulsCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Tree Canvas Box */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 min-h-[320px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* ROOT NODE: CURRENT USER (PARRAIN) */}
          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-emerald-950 border-2 border-emerald-400/50 transform hover:scale-105 transition">
              {currentUser.nom.charAt(0)}{currentUser.postnom.charAt(0)}
            </div>
            
            <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl mt-2 text-center shadow-lg">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Vous (Parrain Principal)</span>
              <p className="text-xs font-bold text-slate-100">{currentUser.nom} {currentUser.postnom}</p>
              <span className="font-mono text-[10.5px] text-slate-400">{currentUser.id}</span>
            </div>

            {/* Downward Connector Stem */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-500 to-slate-700 mt-2" />
          </div>

          {/* CHILD NODES (FILLEULS) OR EMPTY STATE GRAPHIC */}
          {directFilleuls.length === 0 ? (
            <div className="relative z-10 text-center max-w-md py-6 space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Aucun filleul rattaché pour le moment</h4>
              <p className="text-xs text-slate-400">
                Partagez votre lien de parrainage <strong className="text-emerald-400">{currentUser.id}</strong> avec vos contacts. Dès leur inscription, l'arbre graphique se construira en temps réel !
              </p>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager mon Lien Maintenant</span>
              </button>
            </div>
          ) : (
            <div className="relative z-10 w-full">
              {/* Horizontal Connecting Branch Bar */}
              <div className="hidden sm:block w-3/4 max-w-2xl h-0.5 bg-slate-700 mx-auto -mt-6 mb-6" />

              {/* Filleuls Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {directFilleuls.map((filleul) => {
                  const isApproved = filleul.kycStatus === 'approved';
                  return (
                    <div
                      key={filleul.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col items-center text-center shadow-lg transition transform hover:-translate-y-1 relative group"
                    >
                      {/* Vertical connector line on mobile */}
                      <div className="w-0.5 h-3 bg-slate-700 mb-2 sm:hidden" />

                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-md mb-2 ${
                        isApproved
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/30'
                          : 'bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400/30'
                      }`}>
                        {filleul.nom.charAt(0)}{filleul.postnom.charAt(0)}
                      </div>

                      {/* Name & ID */}
                      <h5 className="text-xs font-bold text-slate-100 truncate w-full">
                        {filleul.nom} {filleul.postnom}
                      </h5>
                      <span className="font-mono text-[10.5px] text-emerald-400 font-semibold mt-0.5">
                        {filleul.id}
                      </span>

                      {/* Date & Level */}
                      <span className="text-[10px] text-slate-400 mt-1">
                        Inscrit le : {new Date(filleul.createdAt).toLocaleDateString('fr-FR')}
                      </span>

                      {/* Status Badge */}
                      <span className={`mt-2 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {isApproved ? 'KYC Validé' : 'KYC En Attente'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED FILLEULS DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Liste des Filleuls Directs</h3>
            <p className="text-xs text-slate-400">Détails des membres enregistrés via votre lien de parrainage</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous ({totalFilleulsCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Validés ({activeFilleulsCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              En Attente ({pendingFilleulsCount})
            </button>
          </div>
        </div>

        {filteredFilleuls.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            Aucun filleul trouvé dans cette catégorie.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Membre Filleul</th>
                  <th className="py-3 px-3">ID Référence</th>
                  <th className="py-3 px-3">Date d'Inscription</th>
                  <th className="py-3 px-3">Niveau de Membre</th>
                  <th className="py-3 px-3 text-right">Statut KYC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredFilleuls.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                          {f.nom.charAt(0)}{f.postnom.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{f.nom} {f.postnom}</p>
                          <p className="text-[10px] text-slate-400">{f.telephone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {f.id}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(f.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-3 px-3 capitalize text-slate-300">
                      {f.level}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        f.kycStatus === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {f.kycStatus === 'approved' ? 'Validé' : 'En Attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
