import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  Lock, 
  Unlock, 
  Key, 
  Smartphone, 
  Laptop, 
  Tablet, 
  UserCheck, 
  Link, 
  AlertTriangle 
} from 'lucide-react';

// Structure complète d'un utilisateur centralisé
interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordText: string; // Mot de passe stocké / déchiffré pour le Super Admin
  deviceType: 'ANDROID' | 'IPHONE' | 'TABLET' | 'DESKTOP';
  deviceModel?: string;
  referrerName?: string; // Nom du parrain s'il a utilisé un lien de parrainage
  referrerId?: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  accountStatus: 'ACTIVE' | 'SUSPENDED'; // 'SUSPENDED' bloque tous les mouvements
  balance: number;
  createdAt: string;
}

export const AdminBackofficeView: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  // 1. Chargement de tous les comptes créés (Android, iPhone, PC, Tablettes)
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounts');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Erreur lors de la récupération des comptes.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 2. Basculer l'affichage du mot de passe
  const toggleShowPassword = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // 3. Approuver ou Rejeter le compte / KYC
  const handleUpdateStatus = async (userId: string, kycStatus: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/accounts/${userId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycStatus })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus } : u));
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, kycStatus } : null);
        }
      } else {
        alert("Impossible de mettre à jour le statut du compte.");
      }
    } catch (error) {
      console.error("Erreur de mise à jour du statut :", error);
    }
  };

  // 4. Suspendre ou réactiver TOUS LES MOUVEMENTS du compte
  const handleToggleFreezeAccount = async (userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmMsg = newStatus === 'SUSPENDED' 
      ? "Voulez-vous suspendre TOUS les mouvements (dépôts, retraits, transferts) de ce compte ?" 
      : "Voulez-vous lever la suspension de ce compte ?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/accounts/${userId}/freeze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountStatus: newStatus })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: newStatus } : u));
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, accountStatus: newStatus } : null);
        }
      } else {
        alert("Échec de la modification du statut de suspension.");
      }
    } catch (error) {
      console.error("Erreur de suspension :", error);
    }
  };

  // 5. Supprimer le compte définitivement
  const handleDeleteAccount = async (userId: string, userName: string) => {
    if (!window.confirm(`ACTION IRRÉVERSIBLE : Voulez-vous supprimer définitivement le compte de ${userName} ?`)) return;

    try {
      const res = await fetch(`/api/admin/accounts/${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        if (selectedUser?.id === userId) setSelectedUser(null);
        alert("Le compte a été supprimé définitivement.");
      } else {
        alert("Échec de la suppression du compte.");
      }
    } catch (error) {
      console.error("Erreur de suppression :", error);
    }
  };

  // Icone selon le type d'appareil
  const renderDeviceIcon = (deviceType: UserAccount['deviceType']) => {
    switch (deviceType) {
      case 'ANDROID':
      case 'IPHONE':
        return <Smartphone className="w-4 h-4 text-blue-500" title={`Mobile (${deviceType})`} />;
      case 'TABLET':
        return <Tablet className="w-4 h-4 text-purple-500" title="Tablette" />;
      case 'DESKTOP':
        return <Laptop className="w-4 h-4 text-gray-700" title="Ordinateur" />;
      default:
        return <Smartphone className="w-4 h-4 text-gray-400" />;
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    (user.referrerName && user.referrerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête du Backoffice Super Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-yellow-400" /> Back-Office Super Admin
          </h1>
          <p className="text-sm text-gray-400">Contrôle global des comptes, sécurité, mots de passe et parrainages</p>
        </div>
        <button 
          onClick={fetchAccounts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir les données
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher nom, parrain, email, tél..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-gray-500">
          Total comptes : <span className="font-bold text-gray-800">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Tableau complet des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
              <th className="p-4">Utilisateur & Appareil</th>
              <th className="p-4">Mot de passe</th>
              <th className="p-4">Parrain (Lien)</th>
              <th className="p-4">Statut Approuvé</th>
              <th className="p-4">Mouvements</th>
              <th className="p-4 text-right">Actions Super Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredUsers.map(user => (
              <tr key={user.id} className={`hover:bg-gray-50 ${user.accountStatus === 'SUSPENDED' ? 'bg-red-50/50' : ''}`}>
                
                {/* Utilisateur & Appareil */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {renderDeviceIcon(user.deviceType)}
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email} | {user.phone}</div>
                      <div className="text-[10px] text-gray-400 font-mono">Appareil: {user.deviceModel || user.deviceType}</div>
                    </div>
                  </div>
                </td>

                {/* Mot de passe clair pour Super Admin */}
                <td className="p-4 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span>{showPassword[user.id] ? user.passwordText : '••••••••'}</span>
                    <button 
                      onClick={() => toggleShowPassword(user.id)}
                      className="text-gray-400 hover:text-gray-700"
                      title="Afficher/Masquer le mot de passe"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* Parrain */}
                <td className="p-4">
                  {user.referrerName ? (
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                      <Link className="w-3.5 h-3.5" />
                      {user.referrerName}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Aucun parrain</span>
                  )}
                </td>

                {/* Statut d'approbation */}
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                    user.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user.kycStatus}
                  </span>
                </td>

                {/* Statut Mouvements (Suspendu ou Actif) */}
                <td className="p-4">
                  {user.accountStatus === 'SUSPENDED' ? (
                    <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <Lock className="w-3 h-3" /> SUSPENDU
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <Unlock className="w-3 h-3" /> ACTIF
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 text-right space-x-1">
                  {/* Aperçu du compte */}
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Aperçu du compte"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Approuver */}
                  <button 
                    onClick={() => handleUpdateStatus(user.id, 'VERIFIED')}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Approuver le compte"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>

                  {/* Rejeter */}
                  <button 
                    onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Rejeter le compte"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>

                  {/* Suspendre / Réactiver les mouvements */}
                  <button 
                    onClick={() => handleToggleFreezeAccount(user.id, user.accountStatus)}
                    className={`p-1.5 rounded ${user.accountStatus === 'SUSPENDED' ? 'text-orange-600 hover:bg-orange-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    title={user.accountStatus === 'SUSPENDED' ? "Lever la suspension" : "Suspendre tous les mouvements"}
                  >
                    {user.accountStatus === 'SUSPENDED' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>

                  {/* Supprimer définitivement */}
                  <button 
                    onClick={() => handleDeleteAccount(user.id, user.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL : APERÇU DU COMPTE */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" /> Aperçu détaillé du compte
            </h2>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-xs">Nom complet :</span>
                  <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Téléphone :</span>
                  <p className="font-semibold text-gray-800">{selectedUser.phone}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Email :</span>
                <p className="font-semibold text-gray-800">{selectedUser.email}</p>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-gray-500 text-xs">Mot de passe Super Admin :</span>
                  <p className="font-mono font-bold text-blue-700">{selectedUser.passwordText}</p>
                </div>
                <Key className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-xs">Appareil d'origine :</span>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    {renderDeviceIcon(selectedUser.deviceType)} {selectedUser.deviceType} ({selectedUser.deviceModel || 'N/A'})
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Solde actuel :</span>
                  <p className="font-bold text-green-600">{selectedUser.balance.toLocaleString()} $</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Rattaché au parrain :</span>
                <p className="font-semibold text-indigo-600">{selectedUser.referrerName || "Aucun parrain (Inscription directe)"}</p>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">Mouvements de fonds :</span>
                {selectedUser.accountStatus === 'SUSPENDED' ? (
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Bloqués (Compte Suspendu)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-green-600">Autorisés (Compte Actif)</span>
                )}
              </div>
            </div>

            {/* Boutons d'action Modal */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <button 
                onClick={() => handleToggleFreezeAccount(selectedUser.id, selectedUser.accountStatus)}
                className={`px-3 py-1.5 rounded text-xs font-semibold text-white ${selectedUser.accountStatus === 'SUSPENDED' ? 'bg-orange-600' : 'bg-gray-700'}`}
              >
                {selectedUser.accountStatus === 'SUSPENDED' ? 'Débloquer Mouvements' : 'Suspendre Mouvements'}
              </button>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded text-xs font-semibold hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackofficeView;
