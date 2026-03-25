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
      // Wir prüfen, ob es ein Axios-Fehler ist, um sicher auf die Daten zuzugreifen
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      {/* Glas-Effekt Karte */}
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-10 border border-gray-100 relative overflow-hidden">
        
        {/* Dekorativer Hintergrund-Akzent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <div className="text-center mb-10 relative">
          <div className="inline-flex p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Calendar size={32} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Willkommen zurück</h2>
          <p className="text-gray-500 font-medium">Melde dich an, um deine Events zu verwalten.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 mb-8 rounded-2xl text-red-600 text-sm font-bold animate-shake">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500 font-medium transition-all outline-none"
                placeholder="name@beispiel.de"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500 font-medium transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Anmelden
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center relative">
          <p className="text-gray-500 font-medium text-sm">
            Noch kein Konto?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}