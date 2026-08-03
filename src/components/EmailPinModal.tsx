import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, KeyRound, RefreshCw, X } from 'lucide-react';

interface EmailPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  email: string;
  actionTitle?: string;
}

export const EmailPinModal: React.FC<EmailPinModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  email,
  actionTitle = 'Confirmation de Sécurité'
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [generatedPin, setGeneratedPin] = useState('7842');
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);

  useEffect(() => {
    if (isOpen) {
      // Generate random 4-digit PIN
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedPin(newPin);
      setPin(['', '', '', '']);
      setError('');
      setResendCountdown(30);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendCountdown]);

  if (!isOpen) return null;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleConfirm = () => {
    const entered = pin.join('');
    if (entered === generatedPin) {
      onVerify();
    } else {
      setError('Code PIN incorrect. Veuillez réessayer ou cliquer sur Renvoyer.');
    }
  };

  const handleResend = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(newPin);
    setPin(['', '', '', '']);
    setError('');
    setResendCountdown(30);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{actionTitle}</h3>
            <p className="text-xs text-slate-400">Vérification de sécurité obligatoire</p>
          </div>
        </div>

        {/* Simulated Email Notification Banner */}
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 mb-5 text-xs text-emerald-200 flex items-start gap-2.5">
          <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Code PIN de sécurité envoyé à :</p>
            <p className="font-mono text-emerald-400 font-bold">{email}</p>
            <p className="mt-1 text-[11px] text-emerald-400/80">
              [Mode Démo FlintPay] Code de confirmation envoyé : <span className="font-bold underline text-white font-mono text-xs">{generatedPin}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-3 text-center">
          Entrez le code à 4 chiffres envoyé à votre adresse email pour confirmer :
        </p>

        <div className="flex justify-center gap-3 mb-5">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 font-mono text-2xl text-center rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition shadow-inner"
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 text-center mb-4 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleConfirm}
            disabled={pin.some(p => !p)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Valider la confirmation
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0}
              className="hover:text-emerald-400 transition flex items-center gap-1 disabled:opacity-50 disabled:hover:text-slate-400"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Renvoyer le code PIN {resendCountdown > 0 ? `(${resendCountdown}s)` : ''}
            </button>
            <button onClick={onClose} className="hover:text-slate-200 transition">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
