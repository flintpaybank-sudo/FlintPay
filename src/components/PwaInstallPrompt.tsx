import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Handler for PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if not dismissed before in this session
      const dismissed = sessionStorage.getItem('flintpay_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner for iOS if not dismissed
    if (iosDevice && !isStandalone) {
      const dismissed = sessionStorage.getItem('flintpay_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        alert("Pour installer FlintPay sur iPhone/iPad :\n1. Appuyez sur le bouton 'Partager' en bas de Safari.\n2. Sélectionnez 'Sur l'écran d'accueil'.");
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('flintpay_pwa_dismissed', 'true');
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900/95 to-slate-900/90 border-b border-emerald-500/30 text-slate-100 px-4 py-2.5 relative z-40 transition-all shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Application Mobile FlintPay</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PWA Gratuite
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isIos 
                ? "Installez l'application sur votre écran d'accueil via Partager > Sur l'écran d'accueil."
                : "Accès instantané et sécurisé sans passer par le Play Store / App Store."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition transform active:scale-95"
          >
            {isIos ? <Share className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{isIos ? "Voir instructions iOS" : "Ajouter à l'écran d'accueil"}</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Masquer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
