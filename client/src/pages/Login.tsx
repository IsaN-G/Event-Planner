import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/events');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message?: string } } };
        setError(axiosError.response.data.message || 'Login fehlgeschlagen.');
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl shadow-2xl mb-6">
            <Calendar size={48} className="text-white" />
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white mb-3">Willkommen zurück</h2>
          <p className="text-gray-400 text-xl">Melde dich an, um deine Events zu erleben.</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-950 border border-red-800 rounded-2xl text-red-400 font-medium flex items-center gap-3">
            <AlertCircle size={24} />
            {error}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div>
              <label className="block text-lg font-semibold text-white mb-3">E-MAIL ADRESSE</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-400" size={22} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none"
                  placeholder="name@beispiel.de"
                  required
                />
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
                  className="w-full pl-14 pr-6 py-5 bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white font-black text-2xl rounded-3xl transition-all shadow-2xl shadow-violet-500/40 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={32} /> : 'ANMELDEN'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}