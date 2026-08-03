import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentType } from '../types';
import { 
  ArrowLeftRight, 
  UserCheck, 
  LogIn, 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ShieldAlert, 
  User as UserIcon, 
  Calendar, 
  Phone, 
  Upload, 
  Check, 
  Zap, 
  PiggyBank, 
  Wallet, 
  ShieldCheck,
  Globe,
  Users
} from 'lucide-react';

export const AuthLandingView: React.FC = () => {
  const { login, registerKYC, users } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginEmailOrId, setLoginEmailOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
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
  const [regError, setRegError] = useState('');

  // Auto-detect referral link from URL query parameters or localStorage
  useEffect(() => {
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

      if (refCode) {
        const cleanCode = refCode.trim().toUpperCase();
        setRegData(prev => ({ ...prev, parrainCode: cleanCode }));
        setAuthMode('register');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmailOrId.trim()) {
      setLoginError('Veuillez saisir votre Adresse E-mail ou votre ID FlintPay (ex: FPAY-100201).');
      return;
    }
    if (!loginPassword || !loginPassword.trim()) {
      setLoginError('Veuillez saisir le mot de passe associé à ce compte.');
      return;
    }

    const success = login(loginEmailOrId.trim(), loginPassword.trim());
    if (!success) {
      setLoginError('Identifiant ou mot de passe incorrect. L\'accès est strictement réservé au titulaire du compte.');
    }
  };

  // Handle Register File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedPreview(result);
        setRegData(prev => ({ ...prev, photoPieceUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regData.nom.trim() || !regData.postnom.trim()) {
      setRegError('Veuillez renseigner votre Nom et Post-nom.');
      return;
    }
    if (!regData.email.trim() || !regData.email.includes('@')) {
      setRegError('Veuillez introduire une adresse e-mail valide.');
      return;
    }
    if (!regData.telephone.trim()) {
      setRegError('Veuillez introduire votre numéro de téléphone.');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setRegError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    const success = registerKYC({
      nom: regData.nom,
      postnom: regData.postnom,
      sexe: regData.sexe,
      dateNaissance: regData.dateNaissance || '1995-01-01',
      typePiece: regData.typePiece,
      photoPieceUrl: uploadedPreview || regData.photoPieceUrl,
      email: regData.email,
      pays: regData.pays,
      telephone: regData.telephone,
      password: regData.password,
      parrainCode: regData.parrainCode || null,
    });

    if (!success) {
      setRegError('Échec de la création du compte. Vérifiez les informations saisies.');
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
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Platform Header / Hero Branding */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5" />
          <span>Plateforme Officielle - RDC & Afrique de l'Est</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <span>Flint<span className="text-emerald-400">Pay</span></span>
        </h1>

        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Pour accéder à la plateforme d'échange USD/CDF, à l'épargne rémunérée et à vos portefeuilles, veuillez vous <strong className="text-emerald-400 font-semibold">connecter</strong> ou <strong className="text-emerald-400 font-semibold">créer un compte</strong>.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 card-shadow shadow-2xl relative">
        
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setLoginError(''); }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              authMode === 'login'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Se Connecter</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setRegError(''); }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              authMode === 'register'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Créer un Compte</span>
          </button>
        </div>

        {/* MODE 1: LOGIN FORM */}
        {authMode === 'login' && (
          <div className="space-y-5 fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Connexion à votre espace FlintPay</h2>
                <p className="text-xs text-slate-400">Entrez votre Identifiant (FPAY-XXXXXX), E-mail ou Téléphone</p>
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Identifiant FlintPay, E-mail ou Téléphone *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: FPAY-100201, adresse e-mail ou +243 812..."
                    value={loginEmailOrId}
                    onChange={e => setLoginEmailOrId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="mt-1 flex justify-end">
                  <a href="#support" className="text-[11px] text-emerald-400 hover:underline">Mot de passe oublié ?</a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Se Connecter à mon Compte</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Vous n'avez pas encore de compte FlintPay ?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setRegError(''); }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  S'inscrire gratuitement
                </button>
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: REGISTER FORM */}
        {authMode === 'register' && (
          <div className="space-y-5 fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Inscrivez-vous sur FlintPay</h2>
                <p className="text-xs text-slate-400">Formulaire d'enregistrement KYC sécurisé (AES-256)</p>
              </div>
            </div>

            {regError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {/* Identity fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mutombo"
                      value={regData.nom}
                      onChange={e => setRegData({ ...regData, nom: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Post-nom *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean"
                      value={regData.postnom}
                      onChange={e => setRegData({ ...regData, postnom: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sexe *</label>
                  <select
                    value={regData.sexe}
                    onChange={e => setRegData({ ...regData, sexe: e.target.value as 'M' | 'F' })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date de Naissance *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={regData.dateNaissance}
                      onChange={e => setRegData({ ...regData, dateNaissance: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse E-mail *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="votre.email@domaine.com"
                      value={regData.email}
                      onChange={e => setRegData({ ...regData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pays de Résidence *</label>
                  <select
                    value={regData.pays}
                    onChange={e => setRegData({ ...regData, pays: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Numéro de Téléphone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+243 812 345 678"
                    value={regData.telephone}
                    onChange={e => setRegData({ ...regData, telephone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Créer un Mot de Passe *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Au moins 6 caractères"
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Identity Document Section */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pièce d'Identité *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <select
                    value={regData.typePiece}
                    onChange={e => setRegData({ ...regData, typePiece: e.target.value as DocumentType })}
                    className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  >
                    {documentTypes.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>

                  <label className="flex items-center justify-center gap-2 bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{uploadedPreview ? '✓ Photo sélectionnée' : 'Téléverser photo'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Referral code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Code de Parrainage (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: FPAY-888888"
                  value={regData.parrainCode}
                  onChange={e => setRegData({ ...regData, parrainCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono uppercase"
                />
                {regData.parrainCode && (
                  <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Lien de Parrainage Activé : Vous vous inscrivez sous le parrain <strong className="font-mono text-emerald-200">{regData.parrainCode}</strong>
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <Check className="w-4 h-4" />
                <span>Valider et Créer mon Compte FlintPay</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Vous possédez déjà un compte FlintPay ?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Se connecter à mon compte
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Grid at bottom */}
      <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-200">Clic & Change (+1.25%)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gagnez un bonus instantané de 1.25% sur vos conversions pendant les 2 fenêtres quotidiennes.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-200">Épargne 4% / Jour</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Faites fructifier vos fonds USD et CDF avec un taux d'intérêt quotidien garanti.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-200">Securité & Conformité</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Identifiant unique par membre et données KYC chiffrées aux normes financières (AES-256).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
