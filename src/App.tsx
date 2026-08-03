import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SimulatedTimeBanner } from './components/SimulatedTimeBanner';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { AuthLandingView } from './components/AuthLandingView';
import { DashboardView } from './components/DashboardView';
import { ClickChangeView } from './components/ClickChangeView';
import { SavingsView } from './components/SavingsView';
import { DepositWithdrawView } from './components/DepositWithdrawView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { SupportAnnouncementsView } from './components/SupportAnnouncementsView';
import { ProfileView } from './components/ProfileView';
import { ReferralNetworkView } from './components/ReferralNetworkView';
import { AdminBackofficeView } from './components/AdminBackofficeView';
import { KycRegistrationModal } from './components/KycRegistrationModal';
import { LoginModal } from './components/LoginModal';
import { ArrowLeftRight } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, activeRole } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [initialDepositWithdrawTab, setInitialDepositWithdrawTab] = useState<'deposit' | 'withdrawal'>('deposit');

  // Auto-capture referral code from URL parameter globally on load
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let refCode = searchParams.get('ref') || searchParams.get('parrain') || searchParams.get('code') || searchParams.get('parrainCode') || searchParams.get('refCode');
      if (!refCode && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        refCode = hashParams.get('ref') || hashParams.get('parrain') || hashParams.get('code') || hashParams.get('parrainCode') || hashParams.get('refCode');
      }

      if (refCode) {
        const cleanCode = refCode.trim().toUpperCase();
        localStorage.setItem('flintpay_ref_code', cleanCode);
        sessionStorage.setItem('flintpay_ref_code', cleanCode);
      }
    } catch (e) {
      console.error('Error capturing referral code:', e);
    }
  }, []);

  // Strict Role Security Guard: Redirect non-admin users away from 'admin' tab
  useEffect(() => {
    if (activeTab === 'admin' && activeRole !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, activeRole]);

  const handleOpenDeposit = () => {
    setInitialDepositWithdrawTab('deposit');
    setActiveTab('deposit_withdraw');
  };

  const handleOpenWithdrawal = () => {
    setInitialDepositWithdrawTab('withdrawal');
    setActiveTab('deposit_withdraw');
  };

  const handleOpenSavings = () => {
    setActiveTab('savings');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Simulated Time & Role Switcher Banner */}
      {currentUser && <SimulatedTimeBanner />}

      {/* PWA Mobile Installation Prompt Banner */}
      {currentUser && <PwaInstallPrompt />}

      {/* Main Navbar */}
      {currentUser && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRegisterModal={() => setIsRegisterOpen(true)}
          onOpenLoginModal={() => setIsLoginOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Unauthenticated User: Required Login / Registration View */}
        {!currentUser ? (
          <AuthLandingView />
        ) : (
          /* Authenticated User: Dynamic Tab Views */
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenDeposit={handleOpenDeposit}
                onOpenWithdrawal={handleOpenWithdrawal}
                onOpenSavings={handleOpenSavings}
              />
            )}

            {activeTab === 'clic' && <ClickChangeView />}

            {activeTab === 'savings' && <SavingsView />}

            {activeTab === 'referrals' && <ReferralNetworkView />}

            {activeTab === 'deposit_withdraw' && (
              <DepositWithdrawView initialTab={initialDepositWithdrawTab} />
            )}

            {activeTab === 'history' && <TransactionHistoryView />}

            {activeTab === 'support' && <SupportAnnouncementsView />}

            {activeTab === 'profile' && <ProfileView />}

            {activeTab === 'admin' && activeRole === 'admin' && <AdminBackofficeView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 text-slate-400 text-xs py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200">FlintPay © 2026</span>
            <span className="text-slate-600">•</span>
            <span>Échange USD/CDF & Épargne Rémunérée (RDC, Burundi, Tanzanie, Rwanda, Ouganda)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Taux de Clic : <strong className="text-emerald-400">+1.25%</strong></span>
            <span>Épargne : <strong className="text-indigo-400">4%/jour</strong></span>
            <span>Retrait : <strong className="text-slate-200">3% frais</strong></span>
          </div>
        </div>
      </footer>

      {/* KYC Registration Modal */}
      <KycRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLoginModal={() => setIsLoginOpen(true)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegisterModal={() => setIsRegisterOpen(true)}
      />

      {/* Notification Toast Container */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
