import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign 
} from 'lucide-react';

// Interfaces TypeScript adaptées aux données centrales
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  balance: number;
}

interface TransactionData {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const AdminBackofficeView: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'kyc' | 'transactions' | 'balances'>('kyc');

  // 1. Chargement des données depuis la base de données centrale / API
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Remplacez les URLs ci-dessous par les routes réelles de votre API backend
      const usersRes = await fetch('/api/admin/users');
      const txRes = await fetch('/api/admin/transactions');

      if (usersRes.ok && txRes.ok) {
        const usersData = await usersRes.json();
        const txData = await txRes.json();
        setUsers(usersData);
        setTransactions(txData);
      } else {
        console.error("Erreur de récupération des données serveur");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. Traitement de l'approbation / rejet du KYC
  const handleUpdateKYC = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setUsers(prev =>
          prev.map(user => user.id === userId ? { ...user, kycStatus: status } : user)
        );
      } else {
        alert("Échec de la mise à jour du KYC sur le serveur.");
      }
    } catch (error) {
      console.error("Erreur d'envoi du statut KYC :", error);
    }
  };

  // 3. Traitement de la validation des dépôts / retraits
  const handleUpdateTransaction = async (txId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setTransactions(prev =>
          prev.map(tx => tx.id === txId ? { ...tx, status } : tx)
        );
        // Rafraîchir les utilisateurs pour refléter les nouveaux soldes
        fetchDashboardData();
      } else {
        alert("Erreur lors de la validation de la transaction.");
      }
    } catch (error) {
      console.error("Erreur de validation transaction :", error);
    }
  };

  // 4. Ajustement manuel du solde d'un utilisateur
  const handleAdjustBalance = async (userId: string, newBalance: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
      });

      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u)
        );
      } else {
        alert("Échec de la mise à jour du solde.");
      }
    } catch (error) {
      console.error("Erreur ajustement solde :", error);
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête du Backoffice */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration Centralisée</h1>
          <p className="text-sm text-gray-500">Gestion en temps réel des KYC, transactions et soldes</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Barre de recherche et onglets */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('kyc')}
            className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'kyc' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Validation KYC
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'transactions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <ArrowUpRight className="w-4 h-4" /> Dépôts / Retraits
          </button>
          <button 
            onClick={() => setActiveTab('balances')}
            className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'balances' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <DollarSign className="w-4 h-4" /> Soldes Utilisateurs
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher nom, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Section 1 : Validation KYC */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Téléphone</th>
                <th className="p-4">Statut KYC</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">{user.phone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      user.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleUpdateKYC(user.id, 'VERIFIED')}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Valider KYC"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleUpdateKYC(user.id, 'REJECTED')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Rejeter KYC"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 2 : Dépôts & Retraits */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4">ID Transaction</th>
                <th className="p-4">Type</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-500">{tx.id}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 font-medium ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-orange-600'}`}>
                      {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{tx.amount.toLocaleString()} FCFA</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {tx.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleUpdateTransaction(tx.id, 'APPROVED')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Approuver
                        </button>
                        <button 
                          onClick={() => handleUpdateTransaction(tx.id, 'REJECTED')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 3 : Ajustement des Soldes */}
      {activeTab === 'balances' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Solde Actuel</th>
                <th className="p-4 text-right">Modifier Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{user.balance.toLocaleString()} $</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        const val = prompt(`Nouveau solde pour ${user.name}:`, user.balance.toString());
                        if (val !== null) {
                          const num = parseFloat(val);
                          if (!isNaN(num)) handleAdjustBalance(user.id, num);
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-100"
                    >
                      Ajuster Solde
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBackofficeView;
