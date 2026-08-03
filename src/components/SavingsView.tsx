import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Currency } from '../types';
import {
  PiggyBank,
  TrendingUp,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  KeyRound,
  ShieldCheck,
  DollarSign,
  Coins
} from 'lucide-react';

export const SavingsView: React.FC = () => {
  const { currentUser, depositToSavings, withdrawFromSavings, requestEarlyRelease, systemSettings, addToast } = useApp();

  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw' | 'letter' | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [amountInput, setAmountInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [letterReason, setLetterReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-400 text-sm">Veuillez vous connecter pour gérer votre compte d'épargne.</p>
      </div>
    );
  }

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const val = parseFloat(amountInput);
    if (!val || val <= 0) {
      setErrorMsg('Veuillez entrer un montant valide.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Mot de passe requis pour valider le transfert.');
      return;
    }
    if (passwordInput !== currentUser.password) {
      setErrorMsg('Mot de passe du compte incorrect.');
      return;
    }

    const mainBal = selectedCurrency === 'USD' ? currentUser.balanceUSD : currentUser.balanceCDF;
    if (val > mainBal) {
      setErrorMsg(`Solde principal ${selectedCurrency} insuffisant.`);
      return;
    }

    const success = depositToSavings(selectedCurrency, val);
    if (success) {
      setActiveAction(null);
      setAmountInput('');
      setPasswordInput('');
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const val = parseFloat(amountInput);
    if (!val || val <= 0) {
      setErrorMsg('Veuillez entrer un montant valide.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Mot de passe requis pour valider le retrait d\'épargne.');
      return;
    }
    if (passwordInput !== currentUser.password) {
      setErrorMsg('Mot de passe du compte incorrect.');
      return;
    }

    const savBal = selectedCurrency === 'USD' ? currentUser.savingsUSD : currentUser.savingsCDF;
    if (val > savBal) {
      setErrorMsg(`Solde d'épargne ${selectedCurrency} insuffisant.`);
      return;
    }

    const res = withdrawFromSavings(selectedCurrency, val);
    if (res.success) {
      setActiveAction(null);
      setAmountInput('');
      setPasswordInput('');
    }
  };

  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterReason.trim()) {
      setErrorMsg('Veuillez préciser le motif de votre lettre de lever d\'épargne.');
      return;
    }
    requestEarlyRelease(letterReason);
    setActiveAction(null);
    setLetterReason('');
  };

  // Check 6 months eligibility
  const isEarlyUSD = true; // default warning indicator

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-wide flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5" />
                Compte Épargne Rémunérée
              </span>
              <span className="text-xs text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded">
                Taux d'intérêt : 4% / jour
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100">Portefeuille Épargne FlintPay</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Faites fructifier vos fonds en les gardant au compte épargne pendant 6 mois sans retrait. En cas de retrait anticipé, une pénalité de 12% s'applique.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Période de blocage</span>
            <span className="text-lg font-black text-indigo-400 font-mono">6 Mois Fixes</span>
            <span className="text-[10px] text-slate-500 block">Pénalité anticipée: 12%</span>
          </div>
        </div>
      </div>

      {/* Main Dual Savings Balances Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* USD Savings Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Solde Épargne USD</h3>
                <p className="text-[11px] text-slate-400">Rendement 4%/jour calculé quotidiennement</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              +$ {(currentUser.savingsUSD * systemSettings.savingsInterestRate).toFixed(2)} / jour
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-3xl font-black text-slate-100 font-mono">
              ${currentUser.savingsUSD.toFixed(2)} USD
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Date d'épargne : <span className="font-mono text-slate-300">{currentUser.savingsUSDDate ? new Date(currentUser.savingsUSDDate).toLocaleDateString('fr-FR') : 'Aucun dépôt active'}</span>
            </p>
          </div>
        </div>

        {/* CDF Savings Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Solde Épargne CDF</h3>
                <p className="text-[11px] text-slate-400">Rendement 4%/jour calculé quotidiennement</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20">
              +{Math.round(currentUser.savingsCDF * systemSettings.savingsInterestRate).toLocaleString('fr-FR')} FC / jour
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-3xl font-black text-slate-100 font-mono">
              {currentUser.savingsCDF.toLocaleString('fr-FR')} FC
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Date d'épargne : <span className="font-mono text-slate-300">{currentUser.savingsCDFDate ? new Date(currentUser.savingsCDFDate).toLocaleDateString('fr-FR') : 'Aucun dépôt active'}</span>
            </p>
          </div>
        </div>

      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setActiveAction('deposit');
            setErrorMsg('');
          }}
          className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <PiggyBank className="w-4 h-4" />
          Épargner (Placer des Fonds)
        </button>

        <button
          onClick={() => {
            setActiveAction('withdraw');
            setErrorMsg('');
          }}
          className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4 text-sky-400" />
          Retirer de l'Épargne
        </button>

        <button
          onClick={() => {
            setActiveAction('letter');
            setErrorMsg('');
          }}
          className="p-4 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs rounded-2xl border border-indigo-500/30 transition flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          Lettre de Lever d'Épargne
        </button>
      </div>

      {/* Action Modal / Expandable Panel */}
      {activeAction && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          
          {/* Action 1: Deposit to Savings */}
          {activeAction === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-400" />
                  Placer de l'Argent en Épargne Rémunérée
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Fermer
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
                  {errorMsg}
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sélectionner la Devise</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCurrency('USD')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedCurrency === 'USD'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    USD (Solde: ${currentUser.balanceUSD.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCurrency('CDF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedCurrency === 'CDF'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    CDF (Solde: {currentUser.balanceCDF.toLocaleString('fr-FR')} FC)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Montant à Épargner</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Montant en ${selectedCurrency}`}
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de Passe du Compte (Validation)</label>
                <input
                  type="password"
                  required
                  placeholder="Entrez votre mot de passe pour confirmer"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                <p className="font-semibold text-slate-200">Conditions de souscription :</p>
                <p className="mt-0.5">• Le montant sera souscrit automatiquement de votre solde actuel et envoyé au compte épargne.</p>
                <p>• Génère 4% d'intérêt journalier bloqué pendant 6 mois.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Valider l'Épargne
              </button>
            </form>
          )}

          {/* Action 2: Withdraw from Savings */}
          {activeAction === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-sky-400" />
                  Retirer de l'Épargne vers Solde Principal
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Fermer
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
                  {errorMsg}
                </p>
              )}

              {/* Penalty Notice */}
              <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Règle de Retrait d'Épargne :</p>
                  <p className="text-amber-200/80 mt-0.5">
                    Le retrait demandé avant 6 mois implique l'application d'un taux de <span className="font-bold text-white">12% de pénalité</span> sur le montant retiré. Après 6 mois, aucun frais n'est prélevé.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sélectionner la Devise</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCurrency('USD')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedCurrency === 'USD'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    USD (Épargne: ${currentUser.savingsUSD.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCurrency('CDF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedCurrency === 'CDF'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    CDF (Épargne: {currentUser.savingsCDF.toLocaleString('fr-FR')} FC)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Montant à Retirer</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Montant en ${selectedCurrency}`}
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de Passe du Compte (Validation)</label>
                <input
                  type="password"
                  required
                  placeholder="Entrez votre mot de passe pour valider"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Confirmer le Retrait d'Épargne
              </button>
            </form>
          )}

          {/* Action 3: Early Release Letter */}
          {activeAction === 'letter' && (
            <form onSubmit={handleLetterSubmit} className="space-y-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Lettre de Lever d'Épargne aux Gestionnaires
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Fermer
                </button>
              </div>

              <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-200">
                <p className="font-semibold text-indigo-300">Règle de lever d'épargne :</p>
                <p className="mt-0.5">
                  L'utilisateur peut envoyer une demande de déblocage d'épargne après 1 mois d'épargne effective. La direction examinera votre dossier sous 24h.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motif de la Demande de Déblocage</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Expliquez la raison pour laquelle vous demandez le déblocage anticipé de votre compte épargne..."
                  value={letterReason}
                  onChange={e => setLetterReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Transmettre la Lettre à la Direction
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};
