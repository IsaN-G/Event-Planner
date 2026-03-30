import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  LogOut, 
  Calendar, 
  Ticket, 
  LayoutDashboard, 
  Compass,
  BarChart3 
} from 'lucide-react'; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-10 py-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Calendar size={30} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-4xl font-black tracking-tighter text-white">Event</span>
            <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Planner</span>
          </div>
        </Link>

        {/* Navigation - mehr Abstand */}
        <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2.5 rounded-3xl border border-zinc-800">
          <Link 
            to="/events" 
            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-medium transition-all ${isActive('/events') || isActive('/') 
              ? 'bg-violet-600 text-white' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <Compass size={21} />
            Entdecken
          </Link>

          {user && (
            <Link 
              to="/my-tickets" 
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-medium transition-all ${isActive('/my-tickets') 
                ? 'bg-emerald-600 text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              <Ticket size={21} />
              Meine Tickets
            </Link>
          )}

          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-medium transition-all ${isActive('/dashboard') 
                  ? 'bg-violet-600 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              >
                <LayoutDashboard size={21} />
                Dashboard
              </Link>

              <Link 
                to="/analytics" 
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-medium transition-all ${isActive('/analytics') 
                  ? 'bg-violet-600 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              >
                <BarChart3 size={21} />
                Analytics
              </Link>
            </>
          )}
        </div>

        {/* Rechte Seite */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <button 
                  onClick={() => navigate('/create-event')}
                  className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 px-7 py-3.5 rounded-2xl font-semibold shadow-lg shadow-violet-500/40 transition-all"
                >
                  <PlusCircle size={21} />
                  Event erstellen
                </button>
              )}

              {user.role === 'admin' && (
                <Link to="/admin" className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-2xl transition-all">
                  <ShieldCheck size={24} className="text-violet-400" />
                </Link>
              )}

              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-violet-400 tracking-widest uppercase">{user.role}</div>
                <div className="font-semibold text-white">{user.username}</div>
              </div>

              <button
                onClick={handleLogout}
                className="p-3.5 bg-zinc-900 hover:bg-red-950 hover:text-red-400 border border-zinc-700 rounded-2xl transition-all"
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-3 text-zinc-400 hover:text-white font-medium">Anmelden</Link>
              <Link to="/register" className="bg-white text-black px-7 py-3 rounded-2xl font-semibold hover:bg-zinc-100">Registrieren</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}