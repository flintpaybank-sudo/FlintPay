import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Currency } from '../types';
import {
  MousePointerClick,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Coins,
  DollarSign,
  ArrowRight,
  Zap,
  CheckCircle,
  HelpCircle,
  Award,
  Users
} from 'lucide-react';

export const ClickChangeView: React.FC = () => {
  const { currentUser, users, simulatedHour, setSimulatedHour, clickToChange, systemSettings } = useApp();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [isClickingAnimation, setIsClickingAnimation] = useState(false);

  // Time Window Logic
  const getCurrentHour = () => {
    if (simulatedHour !== null) return simulatedHour;
    return new Date().getHours();
  };

  const currentHour = getCurrentHour();

  // Single click per session check
  const todayStr = new Date().toISOString().split('T')[0];
  const isMorningSlot = currentHour === 9;
  const isAfternoonSlot = currentHour === 15;
  const activeSessionKey = (isMorningSlot || isAfternoonSlot) ? `${todayStr}_${isMorningSlot ? '09' : '15'}` : null;
  const hasClickedCurrentSession = !!(activeSessionKey && currentUser?.lastClickSession === activeSessionKey);

  const getWindowStatus = (hour: number) => {
    if (hour === 9) {
      if (hasClickedCurrentSession) {
        return {
          isActive: false,
          hasClicked: true,
          buttonText: 'CLIC DÉJÀ EFFECTUÉ (09h00)',
          subText: 'Vous avez déjà validé votre gain bonus (+1,25%) pour la session du matin. Prochain créneau à 15h00 !',
          color: 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-not-allowed shadow-none',
          statusText: '1/1 CLIC PARTICIPÉ (09h00)',
        };
      }
      return {
        isActive: true,
        hasClicked: false,
        buttonText: 'CHANGER LA MONNAIE (+1,25%)',
        subText: 'Session Matin Ouverte (09h00 - 09h59) • 1 seul clic par créneau',
        color: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white',
        statusText: 'OUVERT (Session Matin)',
      };
    }
    if (hour === 15) {
      if (hasClickedCurrentSession) {
        return {
          isActive: false,
          hasClicked: true,
          buttonText: 'CLIC DÉJÀ EFFECTUÉ (15h00)',
          subText: 'Vous avez déjà validé votre gain bonus (+1,25%) pour la session du soir. Prochain créneau demain à 09h00 !',
          color: 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-not-allowed shadow-none',
          statusText: '1/1 CLIC PARTICIPÉ (15h00)',
        };
      }
      return {
        isActive: true,
        hasClicked: false,
        buttonText: 'CLIQUEZ POUR GAGNER (+1,25%)',
        subText: 'Session Après-midi Ouverte (15h00 - 15h59) • 1 seul clic par créneau',
        color: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white',
        statusText: 'OUVERT (Session Après-Midi)',
      };
    }
    if (hour >= 10 && hour < 15) {
      return {
        isActive: false,
        hasClicked: false,
        buttonText: 'PAS D\'ACCÈS (Attendre 15h00)',
        subText: 'Prochaine session à 15h00 précises',
        color: 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed',
        statusText: 'FERMÉ (Session Intermédiaire)',
      };
    }
    return {
      isActive: false,
      hasClicked: false,
      buttonText: 'PAS D\'ACCÈS (Attendre 09h00)',
      subText: 'Prochaine session demain à 09h00 précises',
      color: 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed',
      statusText: 'FERMÉ (Nuit / Hors Horaire)',
    };
  };

  const windowStatus = getWindowStatus(currentHour);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-400 text-sm">Veuillez vous connecter pour accéder à la zone de clic.</p>
      </div>
    );
  }

  // Find all direct referrals for this user dynamically
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

  // Level Logic based on actual dynamic referral list count
  const getLevelDetails = () => {
    const referrals = displayCount;
    const usd = currentUser.balanceUSD;
    const cdf = currentUser.balanceCDF;

    if (usd >= 1000 || cdf >= 2400000 || referrals >= 500) {
      return {
        title: 'Membre Sympathisant (Membre Passif)',
        tierNum: 5,
        req: '1 000 USD ou 2 400 000 CDF + 500 Filleuls',
        next: 'Niveau Maximum Atteint !',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        progress: 100,
      };
    }
    if (usd >= 500 || cdf >= 1200000 || referrals >= 300) {
      return {
        title: 'Membre d\'Honneur (Membre Honoraire)',
        tierNum: 4,
        req: '500 USD ou 1 200 000 CDF + 300 Filleuls',
        next: `Prochain Seuil : Membre Sympathisant (1000 USD / 2.4M CDF + 500 Filleuls) • Manque: ${Math.max(0, 500 - referrals)} filleuls ou ${Math.max(0, 1000 - usd).toFixed(2)} USD`,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        progress: 80,
      };
    }
    if (usd >= 100 || cdf >= 240000 || referrals >= 100) {
      return {
        title: 'Membre Fondateur (Membre Promoteur)',
        tierNum: 3,
        req: '100 USD ou 240 000 CDF + 100 Filleuls',
        next: `Prochain Seuil : Membre d'Honneur (500 USD / 1.2M CDF + 300 Filleuls) • Manque: ${Math.max(0, 300 - referrals)} filleuls ou ${Math.max(0, 500 - usd).toFixed(2)} USD`,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        progress: 60,
      };
    }
    if (usd >= 20 || cdf >= 48000 || referrals >= 25) {
      return {
        title: 'Membre Effectif (Membre Associé)',
        tierNum: 2,
        req: '20 USD ou 48 000 CDF + 25 Filleuls',
        next: `Prochain Seuil : Membre Fondateur (100 USD / 240 000 CDF + 100 Filleuls) • Manque: ${Math.max(0, 100 - referrals)} filleuls ou ${Math.max(0, 100 - usd).toFixed(2)} USD`,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        progress: 40,
      };
    }
    return {
      title: 'Membre Adhérent (Membre Usager)',
      tierNum: 1,
      req: 'Compte approvisionné (min 1 USD / 1000 CDF)',
      next: `Prochain Seuil : Membre Effectif (20 USD / 48 000 CDF + 25 Filleuls) • Manque: ${Math.max(0, 25 - referrals)} filleuls ou ${Math.max(0, 20 - usd).toFixed(2)} USD`,
      color: 'text-slate-300 bg-slate-800 border-slate-700',
      progress: 20,
    };
  };

  const levelInfo = getLevelDetails();

  const currentBalance = selectedCurrency === 'USD' ? currentUser.balanceUSD : currentUser.balanceCDF;
  const minRequired = selectedCurrency === 'USD' ? 1 : 1000;
  const isEligibleBalance = currentBalance >= minRequired;
  const expectedGain = currentBalance * systemSettings.clickGainRate;

  const handleClick = () => {
    if (!windowStatus.isActive) return;
    if (!isEligibleBalance) return;

    setIsClickingAnimation(true);
    clickToChange(selectedCurrency);
    setTimeout(() => setIsClickingAnimation(false), 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Moteur d'Incitation
              </span>
              <span className="text-xs text-slate-400 font-medium">Gain Fixe : 1,25% par Clic</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100">Zone de Clic pour Changer</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Augmentez votre capital en cliquant durant les deux fenêtres d'accès quotidiennes. Votre solde s'accroît instantanément de 1,25% à chaque conversion.
            </p>
          </div>

          {/* Quick Time Simulator */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Simulateur d'Horaires :
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{windowStatus.statusText}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setSimulatedHour(9)}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  simulatedHour === 9 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                09h00 (Actif)
              </button>
              <button
                onClick={() => setSimulatedHour(15)}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  simulatedHour === 15 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                15h00 (Actif)
              </button>
              <button
                onClick={() => setSimulatedHour(12)}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  simulatedHour === 12 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                12h00 (Inactif)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Rules Table Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Règles d'Accès aux Sessions de Clic (Heures Serveur)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${currentHour === 9 ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-slate-200">09h00 à 09h59</span>
              <span className="bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[10px]">Vert / Actif</span>
            </div>
            <p className="text-[11px] text-slate-400">Texte: "CHANGER LA MONNAIE"</p>
            <p className="text-[11px] font-bold text-emerald-400 mt-1">Gain: +1,25% crédité</p>
          </div>

          <div className={`p-3 rounded-xl border ${currentHour >= 10 && currentHour < 15 ? 'bg-amber-950/40 border-amber-500/40' : 'bg-slate-950 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-slate-200">10h00 à 14h59</span>
              <span className="bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded text-[10px]">Gris / Inactif</span>
            </div>
            <p className="text-[11px] text-slate-400">Texte: "PAS D'ACCÈS"</p>
            <p className="text-[11px] text-slate-500 mt-1">Attendre 15h00</p>
          </div>

          <div className={`p-3 rounded-xl border ${currentHour === 15 ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-slate-200">15h00 à 15h59</span>
              <span className="bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[10px]">Vert / Actif</span>
            </div>
            <p className="text-[11px] text-slate-400">Texte: "CLIQUEZ POUR GAGNER"</p>
            <p className="text-[11px] font-bold text-emerald-400 mt-1">Gain: +1,25% crédité</p>
          </div>

          <div className={`p-3 rounded-xl border ${currentHour >= 16 || currentHour < 9 ? 'bg-rose-950/40 border-rose-500/40' : 'bg-slate-950 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-slate-200">16h00 à 08h59</span>
              <span className="bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded text-[10px]">Gris / Inactif</span>
            </div>
            <p className="text-[11px] text-slate-400">Texte: "PAS D'ACCÈS"</p>
            <p className="text-[11px] text-slate-500 mt-1">Attendre 09h00 (lendemain)</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Clic & Exchange Stage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Currency Choice & Expected Gain */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">1. Choix de la Devise à Échanger</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`p-3 rounded-xl border text-left transition ${
                selectedCurrency === 'USD'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Portefeuille</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="font-mono font-bold text-slate-100 text-sm">USD → CDF</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Solde: ${currentUser.balanceUSD.toFixed(2)}</p>
            </button>

            <button
              onClick={() => setSelectedCurrency('CDF')}
              className={`p-3 rounded-xl border text-left transition ${
                selectedCurrency === 'CDF'
                  ? 'bg-teal-500/10 border-teal-500 text-teal-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Portefeuille</span>
                <Coins className="w-4 h-4 text-teal-400" />
              </div>
              <p className="font-mono font-bold text-slate-100 text-sm">CDF → USD</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Solde: {currentUser.balanceCDF.toLocaleString('fr-FR')} FC</p>
            </button>
          </div>

          {/* Expected Gain Calculation Widget */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Investissement Actuel :</span>
              <span className="font-mono font-bold text-slate-200">
                {currentBalance} {selectedCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Taux de Gain par Clic :</span>
              <span className="font-mono font-bold text-emerald-400">+1.25%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Taux de Change USD/CDF :</span>
              <span className="font-mono text-slate-300">1 USD = {systemSettings.usdToCdfRate} CDF</span>
            </div>

            <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-200">Gain Estimé au Clic :</span>
              <span className="font-mono text-emerald-400 text-sm">
                +{expectedGain.toFixed(2)} {selectedCurrency}
              </span>
            </div>
          </div>

          {!isEligibleBalance && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Solde minimum requis pour cliquer: {minRequired} {selectedCurrency}</span>
            </div>
          )}
        </div>

        {/* Center Column: The Large Action Button Wireframe */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="max-w-md w-full py-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-6 font-medium">
              <span className={`w-2 h-2 rounded-full ${windowStatus.isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span>{windowStatus.subText}</span>
            </div>

            {/* BIG ACTION BUTTON */}
            <button
              onClick={handleClick}
              disabled={!windowStatus.isActive || !isEligibleBalance || isClickingAnimation}
              className={`w-full py-6 px-8 rounded-2xl font-black text-lg tracking-wide shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 group transform hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${windowStatus.color} ${
                windowStatus.isActive ? 'pulse-animation ring-2 ring-emerald-500/30 shadow-emerald-950/60' : ''
              } ${isClickingAnimation ? 'scale-105 ring-4 ring-emerald-400/50' : ''}`}
            >
              <div className="w-13 h-13 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-all shadow-inner">
                <MousePointerClick className="w-7 h-7" />
              </div>
              <span className="tracking-tight text-xl">{windowStatus.buttonText}</span>
              <span className="text-xs font-medium opacity-90">
                {windowStatus.isActive
                  ? `Convertir ${selectedCurrency} & Créditer +1.25% d'intérêt`
                  : 'Session actuellement fermée par le serveur'}
              </span>
            </button>

            {/* Click Result Feedback / Instructions */}
            <p className="text-xs text-slate-400 mt-6 max-w-sm mx-auto">
              Chaque clic applique l'intérêt de 1,25% sur votre solde actuel et réalise la conversion automatique des devises.
            </p>
          </div>
        </div>

      </div>

      {/* Wireframe UI Section B: Investment Tier Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Structure des Paliers d'Investissement</h3>
            </div>
            <p className="text-xs text-slate-400">Rang des membres calculé selon l'investissement et les filleuls actifs</p>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${levelInfo.color}`}>
            <Sparkles className="w-3.5 h-3.5" />
            Niveau Actuel : {levelInfo.title}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">{levelInfo.title}</span>
            <span className="text-emerald-400 font-mono font-bold">Niveau {levelInfo.tierNum} sur 5</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium pt-1">
            {levelInfo.next}
          </p>
        </div>

        {/* 5 Tiers List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          
          <div className={`p-3 rounded-xl border ${levelInfo.tierNum === 1 ? 'bg-slate-800/80 border-slate-600 ring-1 ring-slate-500' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase text-slate-400">Niveau 1</span>
            <h4 className="font-bold text-slate-200 mt-1">Membre Adhérent</h4>
            <p className="text-[11px] text-slate-400 mt-1">Solde &ge; 1 USD / 1000 CDF</p>
            <p className="text-[10px] text-slate-500 mt-2">0 Filleuls requis</p>
          </div>

          <div className={`p-3 rounded-xl border ${levelInfo.tierNum === 2 ? 'bg-blue-950/40 border-blue-500/40 ring-1 ring-blue-500' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase text-blue-400">Niveau 2</span>
            <h4 className="font-bold text-slate-200 mt-1">Membre Effectif</h4>
            <p className="text-[11px] text-slate-400 mt-1">48 000 CDF / 20 USD</p>
            <p className="text-[10px] text-blue-400 mt-2 font-semibold">+25 Filleuls investis</p>
          </div>

          <div className={`p-3 rounded-xl border ${levelInfo.tierNum === 3 ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase text-emerald-400">Niveau 3</span>
            <h4 className="font-bold text-slate-200 mt-1">Membre Fondateur</h4>
            <p className="text-[11px] text-slate-400 mt-1">240 000 CDF / 100 USD</p>
            <p className="text-[10px] text-emerald-400 mt-2 font-semibold">+100 Filleuls investis</p>
          </div>

          <div className={`p-3 rounded-xl border ${levelInfo.tierNum === 4 ? 'bg-amber-950/40 border-amber-500/40 ring-1 ring-amber-500' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase text-amber-400">Niveau 4</span>
            <h4 className="font-bold text-slate-200 mt-1">Membre d'Honneur</h4>
            <p className="text-[11px] text-slate-400 mt-1">1 200 000 CDF / 500 USD</p>
            <p className="text-[10px] text-amber-400 mt-2 font-semibold">+300 Filleuls investis</p>
          </div>

          <div className={`p-3 rounded-xl border ${levelInfo.tierNum === 5 ? 'bg-purple-950/40 border-purple-500/40 ring-1 ring-purple-500' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase text-purple-400">Niveau 5</span>
            <h4 className="font-bold text-slate-200 mt-1">Membre Sympathisant</h4>
            <p className="text-[11px] text-slate-400 mt-1">2 400 000 CDF / 1000 USD</p>
            <p className="text-[10px] text-purple-400 mt-2 font-semibold">+500 Filleuls investis</p>
          </div>

        </div>
      </div>

    </div>
  );
};
