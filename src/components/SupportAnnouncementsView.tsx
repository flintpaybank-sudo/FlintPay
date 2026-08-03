import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Send,
  PhoneCall,
  Megaphone,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  BellRing
} from 'lucide-react';

export const SupportAnnouncementsView: React.FC = () => {
  const { announcements, systemSettings, addToast } = useApp();

  const [copiedWp, setCopiedWp] = useState(false);
  const [copiedTg, setCopiedTg] = useState(false);
  const [copiedWpGroup, setCopiedWpGroup] = useState(false);
  const [copiedTgGroup, setCopiedTgGroup] = useState(false);

  const wpNum = systemSettings.supportWhatsApp || '+243 888 777 666';
  const tgUser = systemSettings.supportTelegram || '@FlintPaySupport';
  const wpGroupLink = systemSettings.supportWhatsAppGroup || 'https://chat.whatsapp.com/FlintPayOfficialGroup2026';
  const tgGroupLink = systemSettings.supportTelegramGroup || 'https://t.me/FlintPayOfficialCommunity';

  const handleCopy = (text: string, setFn: (val: boolean) => void, label: string) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    addToast(`${label} copié dans le presse-papier !`, 'info');
    setTimeout(() => setFn(false), 2000);
  };

  const activeAnnouncements = announcements.filter(a => a.isActive);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-teal-500/10 text-teal-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-teal-500/20 uppercase tracking-wide flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Service Client & Communaute
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100">Support Client & Communiqués Officiels</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Restez informé des annonces de la direction et contactez l'assistance FlintPay 24/7 sur WhatsApp et Telegram.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Service Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WhatsApp Support Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Service Client WhatsApp</h3>
              <p className="text-xs text-slate-400">Assistance rapide 24h/24 par nos agents de support</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Numéro WhatsApp Direct</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={wpNum}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-emerald-300 font-bold focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(wpNum, setCopiedWp, 'Numéro WhatsApp')}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
                >
                  {copiedWp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWp ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lien du Groupe Officiel WhatsApp</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={wpGroupLink}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(wpGroupLink, setCopiedWpGroup, 'Lien Groupe WhatsApp')}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-1 shrink-0"
                >
                  {copiedWpGroup ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  <span>{copiedWpGroup ? 'Copié' : 'Rejoindre'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Support Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Service Client Telegram</h3>
              <p className="text-xs text-slate-400">Canal et support Telegram officiels FlintPay</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Identifiant Support Telegram</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={tgUser}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-sky-300 font-bold focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(tgUser, setCopiedTg, 'ID Telegram')}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
                >
                  {copiedTg ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTg ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lien du Canal / Groupe Telegram</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={tgGroupLink}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(tgGroupLink, setCopiedTgGroup, 'Lien Groupe Telegram')}
                  className="px-3 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-1 shrink-0"
                >
                  {copiedTgGroup ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  <span>{copiedTgGroup ? 'Copié' : 'Rejoindre'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Announcements & Official Communiqués Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Communiqués & Offres Spéciales</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{activeAnnouncements.length} Annonces actives</span>
        </div>

        {activeAnnouncements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Aucun communiqué officiel publié actuellement.
          </div>
        ) : (
          <div className="space-y-3">
            {activeAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ann.type === 'promo'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : ann.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {ann.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200">{ann.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(ann.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regulatory Compliance & Security Sub-Region Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Conformité Réglementaire & Cadre Légal Sub-Régional</h3>
            <p className="text-xs text-slate-400">Respect des normes bancaires et monétaires en RDC, Burundi, Tanzanie, Rwanda et Ouganda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* RDC */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">🇨🇩 RDC (Congo)</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">BCC & LBA</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Directives de la Banque Centrale du Congo (BCC) relatives aux changeurs de devises et la Loi n° 22/068 contre le blanchiment d'argent et le financement du terrorisme.
            </p>
          </div>

          {/* Burundi */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">🇧🇮 Burundi</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono border border-purple-500/20">BRB Forex</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Conformité avec la Banque de la République du Burundi (BRB) sur le traitement des opérations de change et régulation des intermédiaires financiers.
            </p>
          </div>

          {/* Tanzanie */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">🇹🇿 Tanzanie</span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-mono border border-sky-500/20">BoT Approved</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Normes de la Bank of Tanzania (BoT) régissant les flux de devises étrangères et la protection des avoirs clients des intermédiaires agréés.
            </p>
          </div>

          {/* Rwanda */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">🇷🇼 Rwanda</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/20">BNR Standards</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Cadre légal de la National Bank of Rwanda (BNR) pour l'échange de devises et la traçabilité des opérations de paiement sécurisé.
            </p>
          </div>

          {/* Ouganda */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400">🇺🇬 Ouganda</span>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono border border-rose-500/20">BoU Compliant</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Réglementations Forex de la Bank of Uganda (BoU) pour le transfert de devises et les contrôles anti-fraude transfrontaliers.
            </p>
          </div>

          {/* Stockage Chiffré Cloud S3/GCS */}
          <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">🔐 Vault S3 / GCS</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">AES-256</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Vos documents KYC sont chiffrés à la source (AES-256) et stockés sur des serveurs sécurisés isolés (AWS S3 / Cloud Storage IAM) sans accès public.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
