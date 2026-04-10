import { useState } from 'react';
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
  BarChart3,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react'; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/events' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-[100]">
      <div className="max-w-[1600px] mx-auto px-6 py-5 flex justify-between items-center">
        
      
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-white text-black p-3 rounded-2xl group-hover:bg-violet-500 group-hover:text-white transition-all duration-500 shadow-2xl">
            <Calendar size={24} strokeWidth={3} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">Event</span>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Planner</span>
          </div>
        </Link>

       
        <div className="hidden lg:flex items-center gap-1 bg-zinc-900/40 p-1.5 rounded-[24px] border border-zinc-800/50 backdrop-blur-md">
          <Link 
            to="/events" 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/events') 
              ? 'bg-white text-black shadow-lg' 
              : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Compass size={16} />
            Explore
          </Link>

          {user && (
            <Link 
              to="/my-tickets" 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/my-tickets') 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <Ticket size={16} />
              Tickets
            </Link>
          )}

          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/dashboard') 
                  ? 'bg-violet-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <LayoutDashboard size={16} />
                Stats
              </Link>

              <Link 
                to="/analytics" 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive('/analytics') 
                  ? 'bg-fuchsia-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <BarChart3 size={16} />
                Insights
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <button 
                  onClick={() => navigate('/create-event')}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/20 transition-all active:scale-95"
                >
                  <PlusCircle size={16} />
                  New Event
                </button>
              )}

        
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 pl-4 pr-1.5 py-1.5 rounded-[20px]">
                <div className="text-right hidden sm:block">
                  <div className="text-[8px] font-black text-violet-500 tracking-[0.2em] uppercase leading-none">{user.role}</div>
                  <div className="text-xs font-bold text-white tracking-tight">{user.username}</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <UserIcon size={16} />
                </div>
              </div>

              {user.role === 'admin' && (
                <Link to="/admin" className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all">
                  <ShieldCheck size={20} className="text-violet-400" />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-3 bg-zinc-900/50 hover:bg-red-500/10 hover:text-red-500 border border-zinc-800 rounded-xl transition-all group"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="bg-white text-black px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all shadow-xl">Join Now</Link>
            </div>
          )}

  
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-3 text-white hover:bg-zinc-800 rounded-xl transition-all"
          >
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

   
      {isMobileOpen && (
        <div className="lg:hidden bg-[#09090b]/95 backdrop-blur-2xl border-t border-zinc-800 py-6 px-6">
          <div className="flex flex-col gap-4">
            <Link 
              to="/events" 
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-zinc-800 rounded-2xl transition-all"
            >
              <Compass size={22} /> Explore Events
            </Link>

            {user && (
              <Link 
                to="/my-tickets" 
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-zinc-800 rounded-2xl transition-all"
              >
                <Ticket size={22} /> My Tickets
              </Link>
            )}

            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-zinc-800 rounded-2xl transition-all"
                >
                  <LayoutDashboard size={22} /> Dashboard
                </Link>
                <Link 
                  to="/analytics" 
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-zinc-800 rounded-2xl transition-all"
                >
                  <BarChart3 size={22} /> Analytics
                </Link>
              </>
            )}

            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <button 
                onClick={() => { navigate('/create-event'); setIsMobileOpen(false); }}
                className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 py-5 rounded-3xl text-white font-black uppercase tracking-widest text-lg shadow-xl"
              >
                <PlusCircle size={24} />
                Neues Event erstellen
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}