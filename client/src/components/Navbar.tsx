import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, PlusCircle, LogOut, Calendar, Ticket } from 'lucide-react'; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
    
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded-lg">
            <Calendar size={24} />
          </div>
          <span>Event<span className="text-gray-900">Planner</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/events" className="text-gray-600 hover:text-blue-600 font-bold transition-colors mr-2">
          Entdecken
        </Link>

        {user ? (
          <>
        
            <Link 
              to="/my-tickets" 
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl font-bold transition-all border border-emerald-200"
            >
              <Ticket size={18} />
              Meine Tickets
            </Link>

            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-xl font-bold transition-all border border-purple-200"
              >
                <ShieldCheck size={18} />
                Admin
              </Link>
            )}

           
            {(user.role === 'organizer' || user.role === 'admin') && (
              <Link 
                to="/create-event" 
                className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold transition-all border border-blue-200"
              >
                <PlusCircle size={18} />
                Erstellen
              </Link>
            )}

           
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

           
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">
                {user.role}
              </span>
              <span className="text-gray-900 font-bold leading-none">{user.username}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 px-3 py-2 rounded-xl font-bold transition-all border border-gray-200 hover:border-red-200"
              title="Ausloggen"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
      
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95 shadow-md"
            >
              Registrieren
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}