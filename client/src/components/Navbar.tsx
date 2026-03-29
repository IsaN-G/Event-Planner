import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  LogOut, 
  Calendar, 
  Ticket, 
  LayoutDashboard, 
  Compass 
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
    <nav className="bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-white/50 dark:border-zinc-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        
        {/* Logo - jetzt mit mehr Impact */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-violet-500/30">
            <Calendar size={26} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
              Event
            </span>
            <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Planner
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-2 py-1.5 rounded-3xl border border-white/60 dark:border-zinc-700">
          
          <Link 
            to="/events" 
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-semibold transition-all text-sm ${isActive('/events') || isActive('/') 
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40' 
              : 'text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/70 dark:hover:bg-zinc-800'}`}
          >
            <Compass size={19} />
            <span className="hidden sm:inline">Entdecken</span>
          </Link>

          {user && (
            <Link 
              to="/my-tickets" 
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-semibold transition-all text-sm ${isActive('/my-tickets') 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40' 
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/70 dark:hover:bg-zinc-800'}`}
            >
              <Ticket size={19} />
              <span className="hidden sm:inline">Meine Tickets</span>
            </Link>
          )}

          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-semibold transition-all text-sm ${isActive('/dashboard') 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40' 
                : 'text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/70 dark:hover:bg-zinc-800'}`}
            >
              <LayoutDashboard size={19} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Create Button - mit Gradient */}
              {(user.role === 'organizer' || user.role === 'admin') && (
                <button 
                  onClick={() => navigate('/create-event')}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-violet-500/40 transition-all active:scale-95"
                >
                  <PlusCircle size={20} />
                  <span className="hidden sm:inline">Event erstellen</span>
                </button>
              )}

              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/60 dark:border-zinc-700 rounded-2xl hover:bg-violet-50 dark:hover:bg-zinc-800 transition-all"
                >
                  <ShieldCheck size={22} className="text-violet-600" />
                </Link>
              )}

              {/* User Info */}
              <div className="hidden md:flex flex-col items-end pr-2">
                <span className="text-[10px] font-black tracking-[1px] text-violet-600 dark:text-violet-400 uppercase">
                  {user.role}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {user.username}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/60 dark:border-zinc-700 rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-800 transition-all"
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-600 px-5 py-2.5 transition-colors"
              >
                Anmelden
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-gray-900 to-black hover:from-violet-600 hover:to-fuchsia-600 text-white px-7 py-2.5 rounded-2xl font-semibold transition-all active:scale-95 shadow-lg"
              >
                Registrieren
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}