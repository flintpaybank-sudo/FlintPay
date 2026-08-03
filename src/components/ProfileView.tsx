import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmailPinModal } from './EmailPinModal';
import {
  User,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Mail,
  Phone,
  Calendar,
  Globe,
  FileText,
  MousePointerClick,
  Users,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, users, updateUserByAdmin, addToast } = useApp();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-400 text-sm">Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    addToast(`ID ${currentUser.id} copié !`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const referralLink = `${window.location.origin}/register?ref=${currentUser.id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    addToast('Lien de parrainage copié !', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 8) {
      setPassError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Open Security PIN modal to authorize password update
    setIsPinModalOpen(true);
  };

  const handlePinVerified = () => {
    setIsPinModalOpen(false);
    updateUserByAdmin(currentUser.id, {});
    setNewPassword('');
    setConfirmPassword('');
    addToast('Mot de passe mis à jour avec succès !', 'success');
  };

  const countriesMap: Record<string, string> = {
    CD: 'République Démocratique du Congo',
    BI: 'Burundi',
    TZ: 'Tanzanie',
    RW: 'Rwanda',
    UG: 'Ouganda',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center uppercase shadow-lg shadow-emerald-950">
            {currentUser.nom.charAt(0)}{currentUser.postnom.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-100">
                {currentUser.nom} {currentUser.postnom}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                currentUser.kycStatus === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {currentUser.kycStatus === 'approved' ? 'KYC Approuvé' : 'KYC En Attente'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">ID Référence :</span>
              <span className="font-mono font-bold text-emerald-400">{currentUser.id}</span>
              <button onClick={handleCopyId} className="text-slate-400 hover:text-emerald-400 transition">
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Statut de Membre</span>
          <span className="font-bold text-slate-200">
            {currentUser.level === 'adherant' && 'Membre Adhérent (ou Usager)'}
            {currentUser.level === 'effectif' && 'Membre Effectif (ou Associé)'}
            {currentUser.level === 'fondateur' && 'Membre Fondateur (ou Promoteur)'}
            {currentUser.level === 'honneur' && 'Membre d\'Honneur (ou Honoraire)'}
            {currentUser.level === 'sympathisant' && 'Membre Sympathisant (ou Passif)'}
          </span>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Informations Personnelles
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Adresse E-mail
              </span>
              <span className="font-semibold text-slate-200">{currentUser.email}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Téléphone
              </span>
              <span className="font-mono font-semibold text-slate-200">{currentUser.telephone}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Pays de Résidence
              </span>
              <span className="font-semibold text-slate-200">{countriesMap[currentUser.pays] || currentUser.pays}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date de Naissance
              </span>
              <span className="font-mono text-slate-200">{currentUser.dateNaissance}</span>
            </div>
          </div>
        </div>

        {/* Identity Document & Investment Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Document KYC & Historique d'Investissement
          </h3>

          {/* KYC Image Preview */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <img
              src={currentUser.photoPieceUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
              alt="Document KYC"
              className="w-20 h-14 object-cover rounded-lg border border-slate-700"
            />
            <div className="text-xs">
              <p className="font-bold text-slate-200 capitalize">Document : {currentUser.typePiece.replace('_', ' ')}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Vérifié et enregistré au registre FlintPay</p>
            </div>
          </div>

          {/* Clic / Investment Stats */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                Dernier Clic Effectué :
              </span>
              <span className="font-mono text-slate-200 font-semibold">
                {currentUser.lastClickDate
                  ? new Date(currentUser.lastClickDate).toLocaleString('fr-FR')
                  : 'Aucun clic'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="text-slate-400">Total Investi (Cumulé) :</span>
              <span className="font-mono font-bold text-emerald-400">
                ${currentUser.totalInvestedUSD} USD / {currentUser.totalInvestedCDF.toLocaleString('fr-FR')} CDF
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Referral Link & Network Section */}
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
        const totalFilleulsCount = myFilleuls.length;

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Programme de Parrainage & Liens Filleuls</h3>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                {totalFilleulsCount} Membre{totalFilleulsCount !== 1 ? 's' : ''} Inscrit{totalFilleulsCount !== 1 ? 's' : ''} à votre lien
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Chaque utilisateur possède son propre lien généré automatiquement. Partagez ce lien pour inviter des membres et constituer votre réseau.
            </p>

            {/* List of Referral IDs */}
            {myFilleuls.length > 0 && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Identifiants des Comptes Filleuls ({myFilleuls.length}) :
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {myFilleuls.map(filleul => (
                    <div
                      key={filleul.id}
                      className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs"
                    >
                      <span className="font-mono font-bold text-emerald-400">{filleul.id}</span>
                      <span className="text-slate-300">({filleul.nom} {filleul.postnom})</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(filleul.id);
                          addToast(`ID Filleul ${filleul.id} copié !`, 'info');
                        }}
                        className="ml-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                        title="Copier ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copié' : 'Copier le Lien'}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Change Password Security Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-400" />
          Changement de Mot de Passe
        </h3>

        {passError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
            {passError}
          </p>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nouveau Mot de Passe (min 8 car.)</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmer le Mot de Passe</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Modifier le Mot de Passe (Confirmation par Email)
          </button>
        </form>
      </div>

      {/* Security PIN Confirmation Modal */}
      <EmailPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handlePinVerified}
        email={currentUser.email}
        actionTitle="Confirmation du Changement de Mot de Passe"
      />

    </div>
  );
};
