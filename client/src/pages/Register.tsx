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
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user'); // Wichtig für dein System!
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Wir schicken die Rolle jetzt mit, damit das Backend weiß, was der User darf
      await api.post('/auth/register', { username, email, password, role });
      
      // Ein schönerer Alert oder eine Erfolgsmeldung wäre cool, aber wir bleiben bei deinem Flow:
      alert("Registrierung erfolgreich! Bitte logge dich nun ein. 📧");
      navigate('/login');
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      const errorMessage = axiosError.response?.data?.error || 
                           axiosError.response?.data?.message || 
                           'Registrierung fehlgeschlagen. Prüfe deine Daten.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-xl w-full bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-10 border border-gray-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-green-200 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Calendar size={32} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Konto erstellen</h2>
          <p className="text-gray-500 font-medium">Werde Teil der EventPlanner Community.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 mb-8 rounded-2xl text-red-600 text-sm font-bold animate-pulse">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Benutzername</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500 font-medium transition-all outline-none"
                  placeholder="Dein Name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">E-Mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500 font-medium transition-all outline-none"
                  placeholder="name@mail.de"
                  required
                />
              </div>
            </div>
          </div>

          {/* Passwort */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Passwort</label>
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

          {/* Rollen-Auswahl (Das ist der Clou für dein System!) */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-1">Ich möchte...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                  role === 'user' 
                  ? 'border-blue-600 bg-green-50 text-blue-600' 
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                {role === 'user' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-blue-600" />}
                <User size={24} />
                <span className="font-bold text-xs uppercase tracking-wider text-center">Events buchen</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                  role === 'organizer' 
                  ? 'border-blue-600 bg-green-50 text-blue-600' 
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                {role === 'organizer' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-blue-600" />}
                <Shield size={24} />
                <span className="font-bold text-xs uppercase tracking-wider text-center">Events planen</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Konto erstellen'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium text-sm">
          Bereits ein Konto?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
            Hier anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}