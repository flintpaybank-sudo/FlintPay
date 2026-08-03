import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Zap, ShieldCheck } from 'lucide-react';

export const SimulatedTimeBanner: React.FC = () => {
  const { simulatedHour, setSimulatedHour, activeRole, setActiveRole, currentUser } = useApp();

  const getSlotText = (hour: number | null) => {
    if (hour === 9) return 'Simulé : 09h15 (Session Ouverte 09h00-09h59)';
    if (hour === 15) return 'Simulé : 15h30 (Session Ouverte 15h00-15h59)';
    if (hour === 12) return 'Simulé : 12h00 (Session Fermée)';
    if (hour === 0) return 'Simulé : 00h00 (Versement Épargne 4%)';
    return 'Heure Réelle du Système';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Time Simulator controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            Horaires Clic :
          </span>
          <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono border border-slate-700">
            {getSlotText(simulatedHour)}
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setSimulatedHour(9)}
              className={`px-2 py-0.5 rounded font-medium transition ${
                simulatedHour === 9
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tester la fenêtre du matin 09h00 - 09h59"
            >
              09h00 (Actif)
            </button>
            <button
              onClick={() => setSimulatedHour(15)}
              className={`px-2 py-0.5 rounded font-medium transition ${
                simulatedHour === 15
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tester la fenêtre de l'après-midi 15h00 - 15h59"
            >
              15h00 (Actif)
            </button>
            <button
              onClick={() => setSimulatedHour(12)}
              className={`px-2 py-0.5 rounded font-medium transition ${
                simulatedHour === 12
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tester la fenêtre inactive 12h00"
            >
              12h00 (Inactif)
            </button>
            <button
              onClick={() => setSimulatedHour(0)}
              className={`px-2 py-0.5 rounded font-medium transition ${
                simulatedHour === 0
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simuler le versement quotidien de 4% d'intérêt d'épargne à 00h00"
            >
              00h00 (Épargne 4%)
            </button>
            <button
              onClick={() => setSimulatedHour(null)}
              className={`px-2 py-0.5 rounded font-medium transition ${
                simulatedHour === null
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Réinitialiser sur l'horloge réelle de votre appareil"
            >
              Heure Réelle
            </button>
          </div>
        </div>

        {/* Role Switcher - Only visible if logged in user is genuine Admin */}
        {currentUser?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Espace :</span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveRole('user')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition ${
                  activeRole === 'user'
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                Vue Utilisateur
              </button>
              <button
                onClick={() => setActiveRole('admin')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition ${
                  activeRole === 'admin'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Vue Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
