import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type AxiosError } from 'axios';
import api from '../services/api'; 
import { 
  Calendar, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  AlertCircle 
} from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { username, email, password, role });
      
      alert("Registrierung erfolgreich! Bitte logge dich nun ein.");
      navigate('/login');
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      const errorMessage = axiosError.response?.data?.error || 
                           axiosError.response?.data?.message || 
                           'Registrierung fehlgeschlagen.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl shadow-2xl mb-6">
            <Calendar size={48} className="text-white" />
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white mb-3">Konto erstellen</h2>
          <p className="text-gray-400 text-xl">Werde Teil der EventPlanner Community.</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-950 border border-red-800 rounded-2xl text-red-400 font-medium flex items-center gap-3">
            <AlertCircle size={24} />
            {error}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-3">BENUTZERNAME</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-400" size={22} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl text-white placeholder:text-gray-500"
                    placeholder="Dein Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-3">E-MAIL</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-400" size={22} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl text-white placeholder:text-gray-500"
                    placeholder="name@beispiel.de"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-3">PASSWORT</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-400" size={22} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl text-white placeholder:text-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Rollen-Auswahl */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">Ich möchte...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'user' ? 'border-violet-500 bg-violet-950/50' : 'border-zinc-700 hover:border-zinc-600'}`}
                >
                  <User size={32} className={role === 'user' ? 'text-violet-400' : 'text-gray-400'} />
                  <span className="font-semibold">Events buchen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'organizer' ? 'border-violet-500 bg-violet-950/50' : 'border-zinc-700 hover:border-zinc-600'}`}
                >
                  <Shield size={32} className={role === 'organizer' ? 'text-violet-400' : 'text-gray-400'} />
                  <span className="font-semibold">Events planen</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white font-black text-2xl rounded-3xl transition-all shadow-2xl shadow-violet-500/40 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={32} /> : 'KONTO ERSTELLEN'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Bereits ein Konto?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
                Hier anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}