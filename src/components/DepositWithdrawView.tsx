import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Currency } from '../types';
import { EmailPinModal } from './EmailPinModal';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  DollarSign,
  Coins,
  Lock,
  Smartphone,
  Info
} from 'lucide-react';

interface DepositWithdrawViewProps {
  initialTab?: 'deposit' | 'withdrawal';
}

export const DepositWithdrawView: React.FC<DepositWithdrawViewProps> = ({ initialTab = 'deposit' }) => {
  const { currentUser, transactions, systemSettings, submitDeposit, submitWithdrawal, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal'>(initialTab);

  // Copy States
  const [copiedBinance, setCopiedBinance] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);

  // Deposit Form State
  const [depCurrency, setDepCurrency] = useState<Currency>('USD');
  const [depAmount, setDepAmount] = useState('');
  const [depMethod, setDepMethod] = useState<'binance_bep20' | 'airtel_money' | 'mpesa' | 'orange_money'>('binance_bep20');
  const [depProofUrl, setDepProofUrl] = useState('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80');
  const [uploadedProofPreview, setUploadedProofPreview] = useState<string | null>(null);

  // Withdrawal Form State
  const [witCurrency, setWitCurrency] = useState<Currency>('USD');
  const [witAmount, setWitAmount] = useState('');
  const [witMethod, setWitMethod] = useState<'binance_bep20' | 'airtel_money' | 'mpesa' | 'orange_money'>('mpesa');
  const [witDestination, setWitDestination] = useState('');
  const [witPassword, setWitPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Email Pin Modal State for Withdrawal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-400 text-sm">Veuillez vous connecter pour faire des dépôts et retraits.</p>
      </div>
    );
  }

  const handleCopyBinance = () => {
    navigator.clipboard.writeText(systemSettings.binanceWalletUSD);
    setCopiedBinance(true);
    addToast('Adresse Binance BEP20 copié !', 'info');
    setTimeout(() => setCopiedBinance(false), 2000);
  };

  const handleCopyMobile = () => {
    navigator.clipboard.writeText(systemSettings.mobileMoneyNumber);
    setCopiedMobile(true);
    addToast('Numéro Mobile Money copié !', 'info');
    setTimeout(() => setCopiedMobile(false), 2000);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setUploadedProofPreview(res);
        setDepProofUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depAmount);
    if (!val || val <= 0) {
      addToast('Entrez un montant valide pour le dépôt', 'error');
      return;
    }

    submitDeposit(depCurrency, val, depMethod, uploadedProofPreview || depProofUrl);
    setDepAmount('');
    setUploadedProofPreview(null);
  };

  // Step 1 of withdrawal: Validation of balance rules & password -> Opens PIN modal
  const handleWithdrawClick = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const val = parseFloat(witAmount);
    if (!val || val <= 0) {
      setErrorMsg('Veuillez entrer un montant valide.');
      return;
    }

    const currentBal = witCurrency === 'USD' ? currentUser.balanceUSD : currentUser.balanceCDF;
    if (val > currentBal) {
      setErrorMsg(`Solde ${witCurrency} insuffisant.`);
      return;
    }

    // Check 3.5% reserve constraint
    // Max withdrawal = 96.5% of total balance
    const minReserve = currentBal * 0.035;
    const remainingAfter = currentBal - val;

    if (remainingAfter < minReserve) {
      setErrorMsg(`Règle de sécurité : Vous devez conserver au moins 3,5% de votre solde actuel (${minReserve.toFixed(2)} ${witCurrency}) comme réserve minimale du compte. Solde maximum retirable : ${(currentBal * 0.965).toFixed(2)} ${witCurrency}.`);
      return;
    }

    if (!witDestination.trim()) {
      setErrorMsg('Veuillez indiquer le numéro de votre portefeuille ou téléphone de destination.');
      return;
    }

    if (!witPassword) {
      setErrorMsg('Mot de passe de compte obligatoire.');
      return;
    }

    if (witPassword !== currentUser.password) {
      setErrorMsg('mot de passe erroné');
      return;
    }

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
      setErrorMsg('Le nombre de retraits ne peut pas dépasser 2 fois par 24 heures.');
      return;
    }

    // Trigger PIN verification modal
    setIsPinModalOpen(true);
  };

  // Step 2: Called after email PIN verification is successful
  const handlePinVerified = () => {
    setIsPinModalOpen(false);
    const val = parseFloat(witAmount);
    const success = submitWithdrawal(witCurrency, val, witMethod, witDestination);
    if (success) {
      setWitAmount('');
      setWitDestination('');
      setWitPassword('');
    }
  };

  // Calculate withdrawal preview metrics
  const witAmountVal = parseFloat(witAmount) || 0;
  const witFee = witAmountVal * systemSettings.withdrawalFeeRate;
  const witNet = Math.max(0, witAmountVal - witFee);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Tab Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl flex items-center justify-center gap-2 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'deposit'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Dépôt (Alimenter Compte)
        </button>
        <button
          onClick={() => setActiveTab('withdrawal')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'withdrawal'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Retrait (3% Frais)
        </button>
      </div>

      {/* Official Payment Accounts Info Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          Coordonnées de Paiement Officielles FlintPay
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Binance BEP20 Address Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                Portefeuille Binance BEP20 (USDT / BUSD / BNB)
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20">
                BEP20
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={systemSettings.binanceWalletUSD}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300 focus:outline-none"
              />
              <button
                onClick={handleCopyBinance}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                title="Copier l'adresse Binance"
              >
                {copiedBinance ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Money Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Mobile Money (Airtel, Mpesa, Orange Money)
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                Direct
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={systemSettings.mobileMoneyNumber}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-emerald-300 font-bold focus:outline-none"
              />
              <button
                onClick={handleCopyMobile}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                title="Copier le numéro Mobile Money"
              >
                {copiedMobile ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* TAB 1: DEPOSIT SECTION */}
      {activeTab === 'deposit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Formulaire de Dépôt de Fonds</h2>
              <p className="text-xs text-slate-400">Transmettez la preuve de votre paiement pour validation automatique par la direction</p>
            </div>
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-4 max-w-xl">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Devise de Dépôt *</label>
                <select
                  value={depCurrency}
                  onChange={e => setDepCurrency(e.target.value as Currency)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="USD">Dollar Américain (USD)</option>
                  <option value="CDF">Franc Congolais (CDF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Montant du Dépôt *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Montant en ${depCurrency}`}
                  value={depAmount}
                  onChange={e => setDepAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Méthode de Paiement Utilisée *</label>
              <select
                value={depMethod}
                onChange={e => setDepMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="binance_bep20">Portefeuille Binance (BEP20)</option>
                <option value="airtel_money">Airtel Money</option>
                <option value="mpesa">M-Pesa (Vodacom)</option>
                <option value="orange_money">Orange Money</option>
              </select>
            </div>

            {/* Upload Proof Screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capture d'Écran de la Preuve de Paiement *
              </label>
              <label className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 cursor-pointer transition text-xs text-slate-300">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{uploadedProofPreview ? 'Capture sélectionnée ✓' : 'Télécharger le reçu / screenshot'}</span>
                <input type="file" accept="image/*" onChange={handleProofFileChange} className="hidden" />
              </label>

              {/* Proof Preview */}
              <div className="mt-2 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center gap-3">
                <img
                  src={uploadedProofPreview || depProofUrl}
                  alt="Preuve paiement"
                  className="w-16 h-12 object-cover rounded-lg border border-slate-700"
                />
                <p className="text-[11px] text-slate-400">
                  L'administrateur examinera cette capture pour valider l'approvisionnement du compte.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Soumettre la Demande de Dépôt
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: WITHDRAWAL SECTION */}
      {activeTab === 'withdrawal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Demande de Retrait de Fonds</h2>
              <p className="text-xs text-slate-400">Taux de retrait de 3% applicable automatiquement (Ex: $10 retirés = $9.70 reçus)</p>
            </div>
          </div>

          {/* Rule Alert Box */}
          <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Règles Strictes de Retrait :
            </div>
            <p className="text-amber-200/90">• Le retrait est possible dès le jour de votre premier dépôt.</p>
            <p className="text-amber-200/90">• Impossible de vider intégralement le compte : vous devez conserver <span className="font-bold text-white">au moins 3,5%</span> de votre solde total en réserve. Le solde maximum retirable est fixé à <span className="font-bold text-white">96,5%</span>.</p>
            <p className="text-amber-200/90">• Chaque retrait exige votre mot de passe et un code PIN envoyé à votre email.</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleWithdrawClick} className="space-y-4 max-w-xl">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Devise de Retrait *</label>
                <select
                  value={witCurrency}
                  onChange={e => setWitCurrency(e.target.value as Currency)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="USD">USD (Solde: ${currentUser.balanceUSD.toFixed(2)})</option>
                  <option value="CDF">CDF (Solde: {currentUser.balanceCDF.toLocaleString('fr-FR')} FC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Montant Brut à Retirer *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Montant en ${witCurrency}`}
                  value={witAmount}
                  onChange={e => setWitAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Live Fee Calculation Preview */}
            {witAmountVal > 0 && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Montant demandé :</span>
                  <span className="font-mono text-slate-200">{witAmountVal} {witCurrency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frais de retrait (3%) :</span>
                  <span className="font-mono text-rose-400 font-bold">-{witFee.toFixed(2)} {witCurrency}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 border-t border-slate-800 pt-1">
                  <span>Montant Net à recevoir :</span>
                  <span className="font-mono text-sm">{witNet.toFixed(2)} {witCurrency}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mode de Réception *</label>
              <select
                value={witMethod}
                onChange={e => setWitMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="mpesa">M-Pesa (Vodacom)</option>
                <option value="airtel_money">Airtel Money</option>
                <option value="orange_money">Orange Money</option>
                <option value="binance_bep20">Portefeuille Binance BEP20</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numéro Mobile Money / Adresse du Portefeuille *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: +243 812 345 678 ou 0x71C7..."
                value={witDestination}
                onChange={e => setWitDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de Passe du Compte (Sécurité) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Mot de passe de votre compte FlintPay"
                  value={witPassword}
                  onChange={e => setWitPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Confirmer et Demander le PIN Email
            </button>
          </form>
        </div>
      )}

      {/* Email Verification PIN Modal */}
      <EmailPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handlePinVerified}
        email={currentUser.email}
        actionTitle="Confirmation du Retrait de Fonds"
      />

    </div>
  );
};
