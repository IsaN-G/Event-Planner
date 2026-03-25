import { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, UserCog, Loader2 } from 'lucide-react';

interface UserType {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
     
      const userData = res.data.users || res.data; 
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Fehler beim Laden:", err.message);
      }
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

  if (loading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-10 animate-in fade-in duration-500">
      <h1 className="text-4xl font-black mb-10 flex items-center gap-4 tracking-tighter">
        <ShieldCheck className="text-blue-600" size={40} /> ADMIN <span className="text-blue-600">PANEL</span>
      </h1>
      
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
            <tr>
              <th className="p-8 font-black">Benutzer</th>
              <th className="p-8 font-black">Berechtigung</th>
              <th className="p-8 font-black text-right">Verwalten</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length > 0 ? (
              users.map((u: UserType) => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg">{u.username}</span>
                      <span className="text-xs text-gray-400 font-medium">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                      u.role === 'organizer' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    {u.role !== 'admin' ? (
                      <button 
                        onClick={() => toggleRole(u)} 
                        className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-2xl transition-all active:scale-90"
                        title="Rolle wechseln"
                      >
                        <UserCog size={22} />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 mr-2 uppercase tracking-tighter">Systemgeschützt</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-20 text-center text-gray-400 font-medium italic">
                  Keine Benutzer gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}