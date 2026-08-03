import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  MousePointerClick,
  PiggyBank,
  Wallet,
  History,
  MessageSquare,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  Sparkles,
  ChevronDown,
  Users
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRegisterModal: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenRegisterModal, onOpenLoginModal }) => {
  const { currentUser, activeRole, setActiveRole, logout, systemSettings } = useApp();

  const getLevelBadge = (level?: string) => {
    switch (level) {
      case 'sympathisant':
        return { label: 'Sympathisant (1000$)', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'honneur':
        return { label: 'Membre d\'Honneur (500$)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'fondateur':
        return { label: 'Membre Fondateur (100$)', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'effectif':
        return { label: 'Membre Effectif (20$)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      default:
        return { label: 'Membre Adhérent', bg: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }
  };

  const levelInfo = getLevelBadge(currentUser?.level);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'clic', label: 'Clic & Change (+1.25%)', icon: MousePointerClick, highlight: true },
    { id: 'savings', label: 'Épargne 4%/jour', icon: PiggyBank },
    { id: 'referrals', label: 'Réseau & Parrainage', icon: Users },
    { id: 'deposit_withdraw', label: 'Dépôt & Retrait', icon: Wallet },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'support', label: 'Support & Offres', icon: MessageSquare },
    { id: 'profile', label: 'Profil & Sécurité', icon: User },
  ];

  if (activeRole === 'admin') {
    navItems.push({ id: 'admin', label: 'Back-Office Admin', icon: ShieldCheck });
  }

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Exchange Rate Ticker */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <img src="/publiclogo.svg" className="w-8 h-8 object-contain" alt="FlintPay Logo" />
              <div>
                <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
                  Flint<span className="text-emerald-400">Pay</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block -mt-1">
                  RDC & Afrique de l'Est
                </span>
              </div>
            </button>

            {/* Daily Ticker Badge */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 font-medium">Taux Officiel du Jour :</span>
              <span className="font-mono font-bold text-emerald-400">1 USD = {systemSettings.usdToCdfRate} CDF</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-950'
                        : 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                      : item.highlight
                      ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[9px] uppercase">
                      +1.25%
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Role Controls */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Admin Role Badge if Super Admin */}
                {activeRole === 'admin' ? (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Back-Office Admin</span>
                  </button>
                ) : (
                  /* Level Chip for standard users */
                  <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${levelInfo.bg}`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {levelInfo.label}
                  </span>
                )}

                {/* Account ID / Name Button */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 p-1.5 pr-3 rounded-xl text-left transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow">
                    {currentUser.nom.charAt(0)}{currentUser.postnom.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-xs">
                    <p className="font-semibold text-slate-200 leading-tight">
                      {currentUser.nom} {currentUser.postnom}
                    </p>
                    <p className="font-mono text-[10px] text-emerald-400 font-bold">
                      {currentUser.id}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Quick Logout Button */}
                <button
                  onClick={logout}
                  title="Se déconnecter"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Se Connecter</span>
                </button>
                <button
                  onClick={onOpenRegisterModal}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                >
                  Ouvrir un Compte
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2.5 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
