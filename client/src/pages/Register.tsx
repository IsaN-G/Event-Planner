import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type AxiosError } from 'axios';
import api from '../services/api'; 
import { 
  
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  AlertCircle,
  ArrowRight,
  Zap
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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex p-5 bg-white text-black rounded-[28px] shadow-2xl mb-8 transform rotate-3 group hover:rotate-0 transition-transform duration-500">
            <Zap size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-4">
            Join the <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Squad</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Create your digital festival identity
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Register Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-[48px] p-10 md:p-14 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Username</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500 transition-colors" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/50 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none transition-all"
                    placeholder="GhostRider"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/50 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none transition-all"
                    placeholder="hello@world.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/50 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role Selection - Upgraded */}
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2 text-center">Choose your path</label>
              <div className="grid grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`group relative p-8 rounded-[32px] border transition-all duration-500 flex flex-col items-center gap-4 ${role === 'user' ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'border-zinc-800 bg-zinc-950/30 hover:border-zinc-700'}`}
                >
                  <User size={32} className={role === 'user' ? 'text-violet-500' : 'text-zinc-600 group-hover:text-zinc-400'} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${role === 'user' ? 'text-white' : 'text-zinc-500'}`}>Attendee</span>
                  {role === 'user' && <div className="absolute -top-2 bg-violet-500 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Active</div>}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`group relative p-8 rounded-[32px] border transition-all duration-500 flex flex-col items-center gap-4 ${role === 'organizer' ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_30px_rgba(217,70,239,0.1)]' : 'border-zinc-800 bg-zinc-950/30 hover:border-zinc-700'}`}
                >
                  <Shield size={32} className={role === 'organizer' ? 'text-fuchsia-500' : 'text-zinc-600 group-hover:text-zinc-400'} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${role === 'organizer' ? 'text-white' : 'text-zinc-500'}`}>Organizer</span>
                  {role === 'organizer' && <div className="absolute -top-2 bg-fuchsia-500 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Active</div>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-white hover:bg-violet-600 text-black hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              Already have an identity?{' '}
              <Link to="/login" className="text-white hover:text-violet-500 transition-colors ml-2 underline underline-offset-4">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}