import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Mail, Lock, X, ArrowRight, UserCheck, KeyRound, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterModal: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegisterModal,
}) => {
  const { login, users } = useApp();
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailOrId.trim()) {
      setError('Veuillez saisir votre Adresse E-mail ou votre ID FlintPay (ex: FPAY-100201).');
      return;
    }
    if (!password || !password.trim()) {
      setError('Veuillez saisir le mot de passe associé à ce compte.');
      return;
    }

    const success = login(emailOrId.trim(), password.trim());
    if (success) {
      setEmailOrId('');
      setPassword('');
      onClose();
    } else {
      setError('Identifiant ou mot de passe incorrect. Connexion refusée.');
    }
  };

  const handleQuickLogin = (email: string) => {
    setError('');
    const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const success = login(email, targetUser?.password);
    if (success) {
      setEmailOrId('');
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto fade-in">
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl max-w-md w-full p-6 sm:p-8 card-shadow relative my-8 slide-in">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 transition p-1.5 rounded-xl hover:bg-slate-800/80 transform hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/30">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Connexion FlintPay</h2>
            <p className="text-xs text-slate-400">Accédez à votre portefeuille USD/CDF & Épargne</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2.5 slide-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Identifiant FlintPay ou Adresse E-mail *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Ex: FPAY-100201 ou mutombo@flintpay.com"
                value={emailOrId}
                onChange={e => setEmailOrId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Saisissez votre ID unique (FPAY-XXXXXX) ou votre adresse e-mail de compte.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Mot de passe *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none transition-all shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Entrez votre mot de passe confidentiel.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-3 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Se Connecter à mon Compte</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch to KYC Registration */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 mb-2.5">
            Vous n'avez pas encore de compte FlintPay ?
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegisterModal();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Ouvrir un Compte (Vérification KYC)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
