import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Loader2, 
  Users 
} from 'lucide-react';

interface UserType {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
  bookedEventsCount?: number;
  isActive?: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      const userData = res.data.users || res.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (user: UserType) => {
    const newRole = user.role === 'user' ? 'organizer' : 'user';
    
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      await fetchUsers();
    } catch (err) {
      console.error("Fehler beim Rollen-Update:", err);
      alert("Fehler beim Ändern der Rolle");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-5 mb-12">
          <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white">Admin Panel</h1>
            <p className="text-gray-400 text-xl mt-1">Benutzerverwaltung</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-3">
              <Users size={28} className="text-violet-400" />
              <h2 className="text-2xl font-semibold text-white">Benutzerliste</h2>
            </div>
            <div className="text-sm text-gray-400">
              {users.length} Benutzer insgesamt
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              Keine Benutzer gefunden.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="p-8 hover:bg-zinc-800/60 transition-colors group flex flex-col lg:flex-row lg:items-center gap-8"
                >
                  {/* User Info */}
                  <div className="flex-1 flex items-center gap-5">
                    <div className="w-14 h-14 bg-zinc-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">{user.username}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {/* Zusätzliche Infos */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6 text-sm">
                    <div>
                      <p className="text-gray-500">Registriert</p>
                      <p className="text-white font-medium mt-1">{formatDate(user.createdAt)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Letzter Login</p>
                      <p className="text-white font-medium mt-1">{formatDate(user.lastLogin)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Gebuchte Events</p>
                      <p className="text-white font-semibold mt-1">
                        {user.bookedEventsCount ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Status</p>
                      <div className={`inline-flex items-center gap-2 mt-1 px-4 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {user.isActive ? 'Aktiv' : 'Inaktiv'}
                      </div>
                    </div>
                  </div>

                  {/* Rolle & Aktion */}
                  <div className="flex items-center gap-4 lg:ml-auto">
                    <span className={`px-6 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : user.role === 'organizer' 
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                        : 'bg-zinc-700 text-gray-300'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>

                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => toggleRole(user)}
                        className="px-6 py-3 bg-zinc-800 hover:bg-violet-950 hover:text-violet-400 rounded-2xl transition-all text-sm font-medium"
                      >
                        Rolle ändern
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}