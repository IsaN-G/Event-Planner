import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Loader2, 
  Trash2 
} from 'lucide-react';

interface UserType {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string; // Das Feld aus deiner User.ts
  bookedEventsCount?: number;
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
  }, []);

// AdminDashboard.tsx

useEffect(() => {
  // Funktion, die den Zeitstempel im Backend aktualisiert
  const sendHeartbeat = async () => {
    try {
      await api.post('/admin/heartbeat');
    } catch (err) {
      console.error("Heartbeat fehlgeschlagen", err);
    }
  };

  // Sofort einmal senden beim Laden
  sendHeartbeat();

  // Alle 2 Minuten (120000 ms) wiederholen
  const interval = setInterval(sendHeartbeat, 120000);

  return () => clearInterval(interval); // Aufräumen, wenn Seite verlassen wird
}, []);

  // VERBESSERTE LOGIK: Nur wer wirklich aktiv ist, wird grün
  const getStatusBranding = (lastLogin?: string, createdAt?: string) => {
    if (!lastLogin) {
      return { label: 'Nie online', color: 'bg-zinc-700', text: 'text-zinc-500', pulse: false };
    }

    const lastSeen = new Date(lastLogin).getTime();
    const created = createdAt ? new Date(createdAt).getTime() : 0;
    const now = new Date().getTime();
    
    const diffInMinutes = (now - lastSeen) / (1000 * 60);

    // 1. SCHUTZ: Wenn lastLogin dem Erstellungszeitpunkt entspricht (Standardwert beim Anlegen)
    // Wir lassen eine Toleranz von 1 Sekunde (1000ms)
    if (Math.abs(lastSeen - created) < 1000) {
      return { label: 'Neu angelegt', color: 'bg-zinc-700', text: 'text-zinc-500', pulse: false };
    }

    // 2. GRÜN: Nur wenn innerhalb der letzten 5 Minuten aktiv (Echtzeit-Gefühl)
    if (diffInMinutes <= 5) {
      return { label: 'Online', color: 'bg-emerald-500', text: 'text-emerald-400', pulse: true };
    }

    // 3. GELB: Heute schon mal da gewesen
    if (diffInMinutes <= 1440) { // 24 Stunden
      return { label: 'Zuletzt heute', color: 'bg-orange-500/80', text: 'text-orange-400', pulse: false };
    }

    // 4. ROT: Länger als 3 Tage weg
    return { label: 'Offline', color: 'bg-zinc-600', text: 'text-zinc-500', pulse: false };
  };

  const handleDelete = async (id: number) => {
    if (currentUser && id === currentUser.id) {
      alert("Selbstlöschung nicht möglich!");
      return;
    }
    if (!window.confirm("Benutzer wirklich löschen?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch  {
      alert("Fehler beim Löschen.");
    }
  };

  const toggleRole = async (user: UserType) => {
    const newRole = user.role === 'user' ? 'organizer' : 'user';
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      fetchUsers();
    } catch {
      alert("Fehler beim Ändern der Rolle");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-violet-500" size={50} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-violet-500" size={32} />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h1>
          </div>
          <div className="bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800">
            <span className="text-gray-500 text-xs font-bold uppercase mr-3">Total Users:</span>
            <span className="text-xl font-black">{users.length}</span>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] overflow-hidden">
          <div className="divide-y divide-zinc-800/50">
            {users.map((user) => {
              const status = getStatusBranding(user.lastLogin, user.createdAt);
              
              return (
                <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/[0.01] transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-violet-400 border border-zinc-700">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold">{user.username}</h3>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex-[2] grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] uppercase text-gray-600 font-bold tracking-widest">Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                        <span className={`text-[11px] font-bold uppercase ${status.text}`}>{status.label}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-gray-600 font-bold tracking-widest">Rolle</span>
                      <span className="text-xs font-medium text-gray-300 capitalize">{user.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {user.role !== 'admin' && (
                      <>
                        <button 
                          onClick={() => toggleRole(user)}
                          className="text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          Rolle ändern
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
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