import { User, Transaction, Announcement, SystemSettings } from '../types';

export const initialSystemSettings: SystemSettings = {
  usdToCdfRate: 2400,
  binanceWalletUSD: '0x289dab7ca57109bb4aa29739e8a12eff46b92842',
  mobileMoneyNumber: '+243 999 888 777',
  clickGainRate: 0.0125, // 1.25%
  withdrawalFeeRate: 0.03, // 3%
  savingsInterestRate: 0.04, // 4% daily
  savingsLockMonths: 6,
  savingsEarlyPenalty: 0.12, // 12%
  supportWhatsApp: '+243 888 777 666',
  supportTelegram: '@FlintPaySupport',
  supportWhatsAppGroup: 'https://chat.whatsapp.com/FlintPayOfficialGroup2026',
  supportTelegramGroup: 'https://t.me/FlintPayOfficialCommunity',
};

export const initialUsers: User[] = [
  {
    id: 'FPAY-888888',
    nom: 'Admin',
    postnom: 'Principal',
    sexe: 'M',
    dateNaissance: '1985-01-01',
    typePiece: 'passeport',
    email: 'flint.paybank@gmail.com',
    password: '7432111111',
    pays: 'CD',
    telephone: '+243 888 777 666',
    role: 'admin',
    level: 'sympathisant',
    kycStatus: 'approved',
    balanceUSD: 0,
    balanceCDF: 0,
    savingsUSD: 0,
    savingsCDF: 0,
    referralCode: 'FPAY-888888',
    referralsCount: 0,
    activeReferralsCount: 0,
    createdAt: '2025-12-01T00:00:00Z',
    totalInvestedUSD: 0,
    totalInvestedCDF: 0,
  }
];

export const initialTransactions: Transaction[] = [];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ANN-1',
    title: 'Bienvenue sur la plateforme officielle FlintPay !',
    content: 'Commencez à échanger et à faire fructifier votre capital avec un gain de 1,25% par clic durant nos deux fenêtres d\'accès quotidiennes (09h-10h et 15h-16h).',
    type: 'info',
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ANN-2',
    title: 'Bonus spécial Parrainage',
    content: 'Recevez une commission automatique sur chaque dépôt qualifié de vos filleuls actifs. Augmentez votre rang pour débloquer le statut Membre Fondateur.',
    type: 'promo',
    isActive: true,
    createdAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'ANN-3',
    title: 'Mise à jour du taux de change USD / CDF',
    content: 'Le taux officiel système est ajusté à 1 USD = 2,400 CDF. Toutes les conversions manuelles et automatiques sont calculées sur ce taux direct.',
    type: 'info',
    isActive: true,
    createdAt: '2026-07-25T14:00:00Z',
  }
];
