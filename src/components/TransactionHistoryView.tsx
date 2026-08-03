import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType, TransactionStatus } from '../types';
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  MousePointerClick,
  PiggyBank,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { currentUser, transactions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-400 text-sm">Veuillez vous connecter pour voir votre historique.</p>
      </div>
    );
  }

  // Filter transactions for current user
  const userTransactions = transactions.filter(t => t.userId === currentUser.id);

  const filtered = userTransactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTransactionBadge = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return { label: 'Dépôt', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ArrowDownLeft };
      case 'withdrawal':
        return { label: 'Retrait', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: ArrowUpRight };
      case 'exchange_click':
        return { label: 'Gain Clic (+1.25%)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: MousePointerClick };
      case 'savings_deposit':
        return { label: 'Dépôt Épargne', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: PiggyBank };
      case 'savings_withdrawal':
        return { label: 'Retrait Épargne', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: PiggyBank };
      default:
        return { label: 'Échange Manuel', bg: 'bg-slate-700/50 text-slate-300 border-slate-600', icon: RefreshCw };
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return { label: 'Validé', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'pending':
        return { label: 'En attente', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'rejected':
        return { label: 'Rejeté', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Inconnu', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">Historique des Transactions</h1>
          </div>
          <p className="text-xs text-slate-400">Relevé complet de vos dépôts, retraits, gains de clics et mouvements d'épargne</p>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-400">Total Opérations : </span>
          <span className="font-bold text-emerald-400">{userTransactions.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par ID ou méthode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="deposit">Dépôts</option>
            <option value="withdrawal">Retraits</option>
            <option value="exchange_click">Gains de Clic (+1.25%)</option>
            <option value="savings_deposit">Dépôts Épargne</option>
            <option value="savings_withdrawal">Retraits Épargne</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Validés</option>
            <option value="pending">En attente</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
            Aucune transaction ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Réf ID</th>
                  <th className="py-3 px-3">Date & Heure</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Montant Brut</th>
                  <th className="py-3 px-3">Frais</th>
                  <th className="py-3 px-3">Montant Net</th>
                  <th className="py-3 px-3">Méthode / Destinataire</th>
                  <th className="py-3 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((trx) => {
                  const badge = getTransactionBadge(trx.type);
                  const statusInfo = getStatusBadge(trx.status);
                  const Icon = badge.icon;
                  const isPositive = trx.type === 'deposit' || trx.type === 'exchange_click' || trx.type === 'savings_withdrawal';

                  return (
                    <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold whitespace-nowrap">
                        {trx.id}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(trx.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${badge.bg}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-200 whitespace-nowrap">
                        {trx.amount} {trx.currency}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-rose-400 whitespace-nowrap">
                        {trx.feeAmount ? `${trx.feeAmount} ${trx.currency}` : '-'}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-100 whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-400' : 'text-slate-200'}>
                          {isPositive ? '+' : ''}{trx.netAmount} {trx.currency}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                        {trx.paymentMethod}
                        {trx.destinationAccount && ` (${trx.destinationAccount})`}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
