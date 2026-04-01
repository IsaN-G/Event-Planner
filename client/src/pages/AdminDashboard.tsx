import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  
  Trash2, 
  UserCircle, 
  Activity, 
  Zap, 
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';

interface UserType {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      const userData = res.data.users || res.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Heartbeat Logik
    const sendHeartbeat = async () => {
      try { await api.post('/admin/heartbeat'); } catch (err) { console.error(err); }
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 120000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBranding = (lastLogin?: string, createdAt?: string) => {
    if (!lastLogin) return { label: 'Nie online', color: 'bg-zinc-800', text: 'text-zinc-600', pulse: false };

    const lastSeen = new Date(lastLogin).getTime();
    const created = createdAt ? new Date(createdAt).getTime() : 0;
    const now = new Date().getTime();
    const diffInMinutes = (now - lastSeen) / (1000 * 60);

    if (Math.abs(lastSeen - created) < 1000) {
      return { label: 'Neu angelegt', color: 'bg-blue-500/50', text: 'text-blue-400', pulse: false };
    }
    if (diffInMinutes <= 5) {
      return { label: 'Live Online', color: 'bg-emerald-500', text: 'text-emerald-400', pulse: true };
    }
    if (diffInMinutes <= 1440) {
      return { label: 'Zuletzt heute', color: 'bg-orange-500', text: 'text-orange-400', pulse: false };
    }
    return { label: 'System Offline', color: 'bg-zinc-700', text: 'text-zinc-500', pulse: false };
  };

  const handleDelete = async (id: number) => {
    if (currentUser && id === currentUser.id) return alert("Selbstlöschung nicht möglich!");
    if (!window.confirm("User unwiderruflich aus der Datenbank entfernen?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { alert("Fehler beim Löschen."); }
  };

  const toggleRole = async (user: UserType) => {
    const newRole = user.role === 'user' ? 'organizer' : 'user';
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      fetchUsers();
    } catch { alert("Fehler beim Ändern der Rolle"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-16 px-6 relative overflow-hidden">
      {/* Admin Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-500 mb-2">
                <ShieldAlert size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Authority</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
              Admin <span className="bg-gradient-to-r from-red-600 to-violet-600 bg-clip-text text-transparent">Panel</span>
            </h1>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] flex items-center gap-6 backdrop-blur-md">
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Database Size</span>
                <span className="text-3xl font-black italic tracking-tighter">{users.length} <span className="text-sm text-zinc-700">Users</span></span>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                <UserCircle size={28} />
            </div>
          </div>
        </div>

        {/* USER LIST CONTAINER */}
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[40px] overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 divide-y divide-zinc-800/50">
            {users.map((user) => {
              const status = getStatusBranding(user.lastLogin, user.createdAt);
              const isAdmin = user.role === 'admin';
              
              return (
                <div key={user.id} className="group p-8 flex flex-col lg:flex-row lg:items-center gap-8 hover:bg-white/[0.02] transition-all">
                  
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-5 lg:w-1/3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border transition-all duration-500 ${isAdmin ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-zinc-800 border-zinc-700 text-zinc-500 group-hover:border-violet-500 group-hover:text-violet-400'}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                        {user.username}
                        {isAdmin && <ShieldCheck size={16} className="text-red-500" />}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>

                  {/* Status & Role Section */}
                  <div className="flex-1 grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.3em] flex items-center gap-2">
                        <Activity size={10} /> Live-Status
                      </span>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-ping' : ''}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${status.text}`}>{status.label}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.3em] flex items-center gap-2">
                        <Zap size={10} /> Permission
                      </span>
                      <div className={`text-[11px] font-black uppercase tracking-widest ${isAdmin ? 'text-red-500' : 'text-zinc-400'}`}>
                        {user.role}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {!isAdmin ? (
                      <>
                        <button 
                          onClick={() => toggleRole(user)}
                          className="flex items-center gap-2 bg-zinc-800/50 hover:bg-violet-600 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all group/btn"
                        >
                          <ArrowRightLeft size={14} className="text-zinc-500 group-hover/btn:text-white" />
                          Rolle ändern
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-3 bg-zinc-800/50 hover:bg-red-600 text-zinc-500 hover:text-white rounded-xl transition-all shadow-lg"
                          title="Benutzer löschen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <div className="px-5 py-3 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500/50 italic">
                        System Protected
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}