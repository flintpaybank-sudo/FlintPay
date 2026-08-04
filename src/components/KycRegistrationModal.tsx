import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentType } from '../types';
import { UserCheck, Upload, FileText, Lock, Mail, Phone, Calendar, User as UserIcon, Shield, Check, X, LogIn } from 'lucide-react';

interface KycRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

export const KycRegistrationModal: React.FC<KycRegistrationModalProps> = ({ isOpen, onClose, onOpenLoginModal }) => {
  const { registerKYC } = useApp();

  const [formData, setFormData] = useState({
    nom: '',
    postnom: '',
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
    typePiece: 'carte_electeur' as DocumentType,
    photoPieceUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    email: '',
    pays: 'CD',
    telephone: '',
    password: '',
    parrainCode: '',
  });

  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Auto-detect referral code from URL parameters or localStorage when modal opens
  useEffect(() => {
    if (!isOpen) return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let refCode = searchParams.get('ref') || searchParams.get('parrain') || searchParams.get('code') || searchParams.get('parrainCode') || searchParams.get('refCode');
      if (!refCode && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        refCode = hashParams.get('ref') || hashParams.get('parrain') || hashParams.get('code') || hashParams.get('parrainCode') || hashParams.get('refCode');
      }

      if (!refCode) {
        refCode = localStorage.getItem('flintpay_ref_code') || sessionStorage.getItem('flintpay_ref_code');
      } else {
        localStorage.setItem('flintpay_ref_code', refCode.trim().toUpperCase());
        sessionStorage.setItem('flintpay_ref_code', refCode.trim().toUpperCase());
      }

      if (refCode && !formData.parrainCode) {
        setFormData(prev => ({ ...prev, parrainCode: refCode.trim().toUpperCase() }));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedPreview(result);
        setFormData(prev => ({ ...prev, photoPieceUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nom.trim() || !formData.postnom.trim()) {
      setError('Veuillez renseigner votre Nom et Post-nom.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Veuillez introduire une adresse e-mail valide.');
      return;
    }
    if (!formData.telephone.trim()) {
      setError('Veuillez introduire votre numéro de téléphone.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    try {
      // 1. Envoi des données de l'utilisateur vers votre backend/Neon
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          postnom: formData.postnom,
          sexe: formData.sexe,
          dateNaissance: formData.dateNaissance || '1995-01-01',
          typePiece: formData.typePiece,
          photoPieceUrl: uploadedPreview || formData.photoPieceUrl,
          email: formData.email,
          pays: formData.pays,
          telephone: formData.telephone,
          password: formData.password,
          parrainCode: formData.parrainCode || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du compte sur le serveur.");
      }

      // 2. Mettre à jour l'état local dans l'application
      registerKYC({
        nom: formData.nom,
        postnom: formData.postnom,
        sexe: formData.sexe,
        dateNaissance: formData.dateNaissance || '1995-01-01',
        typePiece: formData.typePiece,
        photoPieceUrl: uploadedPreview || formData.photoPieceUrl,
        email: formData.email,
        pays: formData.pays,
        telephone: formData.telephone,
        password: formData.password,
        parrainCode: formData.parrainCode || null,
      });

      onClose();
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || "Impossible d'enregistrer le compte sur le serveur.");
    }
  };
  const documentTypes: { id: DocumentType; label: string }[] = [
    { id: 'carte_electeur', label: 'Carte d\'électeur' },
    { id: 'permis', label: 'Permis de conduire' },
    { id: 'passeport', label: 'Passeport' },
    { id: 'carte_etudiant', label: 'Carte d\'étudiant' },
    { id: 'tenant_lieu', label: 'Tenant-lieu de passeport' },
    { id: 'cepgl', label: 'Carte CEPGL' },
  ];

  const countries = [
    { code: 'CD', name: 'Rép. Dém. du Congo (RDC)', dial: '+243' },
    { code: 'BI', name: 'Burundi', dial: '+257' },
    { code: 'TZ', name: 'Tanzanie', dial: '+255' },
    { code: 'RW', name: 'Rwanda', dial: '+250' },
    { code: 'UG', name: 'Ouganda', dial: '+256' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto fade-in">
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 card-shadow relative my-8 slide-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 transition p-1.5 rounded-xl hover:bg-slate-800/80 transform hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/30">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Ouverture de Compte & KYC</h2>
            <p className="text-xs text-slate-400">Vérification de sécurité et création d'identifiant FlintPay</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold slide-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nom *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Mutombo"
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Post-nom *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean"
                  value={formData.postnom}
                  onChange={e => setFormData({ ...formData, postnom: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sexe *</label>
              <select
                value={formData.sexe}
                onChange={e => setFormData({ ...formData, sexe: e.target.value as 'M' | 'F' })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
              >
                <option value="M">Masculin (M)</option>
                <option value="F">Féminin (F)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date de Naissance *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={formData.dateNaissance}
                  onChange={e => setFormData({ ...formData, dateNaissance: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse E-mail *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="votre.email@domaine.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pays de Résidence *</label>
              <select
                value={formData.pays}
                onChange={e => setFormData({ ...formData, pays: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Numéro de Téléphone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="+243 812 345 678"
                value={formData.telephone}
                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Identity Document Section with File Upload Drag zone */}
          <div className="border-t border-slate-800/80 pt-4 mt-2">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Pièce d'Identité Valable (KYC) *
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Veuillez sélectionner votre document officiel et télécharger une photo lisible.
            </p>

            <div className="flex items-start gap-2.5 p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl mb-3 text-[11px] text-emerald-300">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200">Sécurisation Chiffrée AES-256 & Protection Anti-Fraude</p>
                <p className="text-slate-400 text-[10.5px]">
                  Vos pièces sont chiffrées puis stockées de façon sécurisée (Cloud Vault IAM). Un seul compte est autorisé par numéro de téléphone et pièce d'identité (LBA/FT).
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Type de document</label>
                <select
                  value={formData.typePiece}
                  onChange={e => setFormData({ ...formData, typePiece: e.target.value as DocumentType })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none transition-all"
                >
                  {documentTypes.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Enhanced File Upload Drag/Drop Box */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Photo de la Pièce d'Identité (JPG, PNG)</label>
                <div className="file-upload rounded-2xl p-5 text-center cursor-pointer relative group">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  
                  {uploadedPreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={uploadedPreview}
                        alt="Aperçu pièce KYC"
                        className="max-h-32 rounded-xl border border-slate-700 shadow-md mb-2 object-cover"
                      />
                      <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Photo chargée avec succès
                      </p>
                      <span className="text-[11px] text-slate-400 mt-1 hover:text-rose-400 transition" onClick={(e) => { e.stopPropagation(); setUploadedPreview(null); }}>
                        Cliquez pour changer la photo
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-200">Cliquez ou glissez-déposez votre photo ici</p>
                      <p className="text-[10px] text-slate-400 mt-1">Formats acceptés : JPG, PNG, PDF (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mot de Passe (minimum 8 caractères) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Code Parrain (Optionnel)
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ex: FPAY-123456"
                  value={formData.parrainCode}
                  onChange={e => setFormData({ ...formData, parrainCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-all shadow-inner font-mono uppercase"
                />
              </div>
              {formData.parrainCode && (
                <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] font-semibold flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lien de Parrainage Activé : Parrain <strong className="font-mono text-emerald-200">{formData.parrainCode}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 mt-4">
            {onOpenLoginModal ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition transform hover:scale-[1.02]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Déjà un compte ? Connectez-vous ici</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Soumettre et Générer mon ID</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
