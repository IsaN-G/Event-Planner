import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decor - Violet Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex p-5 bg-white text-black rounded-[28px] shadow-2xl mb-8 transform -rotate-3 group hover:rotate-0 transition-transform duration-500">
            <Calendar size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-4">
            Welcome <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Back</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Access your digital experience
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Login Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-[40px] p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">E-Mail Identity</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/50 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none transition-all"
                  placeholder="your@identity.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Secure Access</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-white hover:bg-violet-600 text-black hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Enter Console <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              No account yet?{' '}
              <Link to="/register" className="text-white hover:text-violet-500 transition-colors ml-2 underline underline-offset-4">
                Join the Movement
              </Link>
            </p>
          </div>
        </div>

        {/* Sub-Footer Text */}
        <p className="mt-12 text-center text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">
          Secured Entry • Verified Access Only
        </p>
      </div>
    </div>
  );
}