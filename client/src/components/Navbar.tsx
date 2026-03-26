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

  // Hilfsfunktion: Prüft ob ein Pfad aktiv ist (für das Styling)
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b px-8 py-3 flex justify-between items-center sticky top-0 z-50">
    
      {/* Logo Bereich */}
      <div className="flex items-center gap-2">
        <Link to="/" className="group flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-blue-100">
            <Calendar size={22} />
          </div>
          <span className="text-2xl font-black text-blue-600 tracking-tighter">
            Event<span className="text-gray-900">Planner</span>
          </span>
        </Link>
      </div>

      {/* Navigations Links & User Actions */}
      <div className="flex items-center gap-3">
        
        {/* Haupt-Navigation */}
        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl mr-2">
          <Link 
            to="/events" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              isActive('/events') || isActive('/') 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <Compass size={18} />
            <span className="hidden sm:inline">Entdecken</span>
          </Link>

          {user && (
            <Link 
              to="/my-tickets" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                isActive('/my-tickets') 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              <Ticket size={18} />
              <span className="hidden sm:inline">Tickets</span>
            </Link>
          )}

          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                isActive('/dashboard') 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
        </div>

        {user ? (
          <>
            {/* Quick Action: Event Erstellen (Nutzung von PlusCircle) */}
            {(user.role === 'organizer' || user.role === 'admin') && (
              <button 
                onClick={() => navigate('/create-event')}
                className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-100 group shrink-0"
                title="Neues Event erstellen"
              >
                <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            )}

            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`p-2.5 rounded-xl transition-all border ${
                  isActive('/admin') 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100'
                }`}
                title="Admin Bereich"
              >
                <ShieldCheck size={20} />
              </Link>
            )}

            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden xs:block"></div>

            {/* User Profil Info */}
            <div className="hidden xs:flex flex-col items-end mr-1">
              <span className="text-[9px] text-blue-600 uppercase font-black tracking-widest leading-none mb-1 px-1.5 py-0.5 bg-blue-50 rounded-md">
                {user.role}
              </span>
              <span className="text-gray-900 font-bold leading-none text-sm">{user.username}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2.5 bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100 hover:border-red-100"
              title="Ausloggen"
            >
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              Registrieren
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}