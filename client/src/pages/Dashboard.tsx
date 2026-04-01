import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Edit3, 
  Trash2, 
  PlusCircle, 
 
  CalendarDays, 
  
  ExternalLink,
  AlertCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  maxParticipants: number;
  imageUrl?: string;
  bookingsCount?: number;
}

export default function Dashboard() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/events/me');
        setMyEvents(response.data.events || response.data || []);
      } catch (err: unknown) {
        console.error("Dashboard Fetch Error:", err);
        const error = err as { response?: { status: number } };
        if (error.response?.status !== 404) {
          setError('Verbindung zum Server fehlgeschlagen.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Möchtest du dieses Event wirklich unwiderruflich löschen?')) return;

    try {
      await api.delete(`/events/${id}`);
      setMyEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("Löschfehler:", err);
      alert('Löschen fehlgeschlagen.');
    }
  };

  // Hilfsvariablen für Statistiken
  const totalBookings = myEvents.reduce((sum, event) => sum + (event.bookingsCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-16 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-violet-500 mb-2">
                <LayoutDashboard size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Management Console</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
              Your <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Control</span>
            </h1>
          </div>

          <button 
            onClick={() => navigate('/create-event')}
            className="flex items-center gap-3 bg-white text-black hover:bg-violet-600 hover:text-white px-8 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all shadow-2xl active:scale-95 group"
          >
            <PlusCircle size={20} />
            Neues Event erstellen
          </button>
        </div>

        {/* STATS ROW */}
        {!loading && myEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-[32px] backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Gesamt Events</p>
                    <p className="text-4xl font-black italic tracking-tighter">{myEvents.length}</p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-[32px] backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Teilnehmer gesamt</p>
                    <div className="flex items-center gap-3">
                        <p className="text-4xl font-black italic tracking-tighter text-fuchsia-500">{totalBookings}</p>
                        <Users size={24} className="text-zinc-700" />
                    </div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-[32px] backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Durchschn. Auslastung</p>
                    <div className="flex items-center gap-3">
                        <p className="text-4xl font-black italic tracking-tighter text-violet-500">
                            {myEvents.length > 0 ? Math.round((totalBookings / myEvents.reduce((s, e) => s + e.maxParticipants, 0)) * 100) : 0}%
                        </p>
                        <TrendingUp size={24} className="text-zinc-700" />
                    </div>
                </div>
            </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[24px] flex items-center gap-4 mb-10 text-red-500">
            <AlertCircle size={20} />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : myEvents.length === 0 ? (
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[40px] p-20 text-center border-dashed">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 text-zinc-700">Noch keine Events am Start</h2>
            <button 
              onClick={() => navigate('/create-event')}
              className="mt-6 bg-zinc-800 hover:bg-white hover:text-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              Jetzt loslegen
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {myEvents.map(event => (
              <div 
                key={event.id} 
                className="group bg-zinc-900/30 border border-zinc-800/50 hover:border-violet-500/30 rounded-[40px] overflow-hidden transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Bild Sektion */}
                  <div className="lg:w-80 h-64 lg:h-auto relative shrink-0">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%]"
                      alt={event.title}
                    />
                    <div className="absolute top-6 left-6">
                      <div className="bg-black/60 backdrop-blur-xl text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] italic border border-white/10">
                        {event.category}
                      </div>
                    </div>
                  </div>

                  {/* Info Sektion */}
                  <div className="flex-1 p-10 flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-violet-400 mb-2">
                             <CalendarDays size={14} />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {new Date(event.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                             </span>
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-tight group-hover:text-violet-400 transition-colors">
                        {event.title}
                        </h3>
                    </div>

                    {/* Buchungs-Progress */}
                    <div className="mb-10 bg-black/20 p-6 rounded-3xl border border-zinc-800/50">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tickets verkauft</span>
                        <span className="font-black italic text-xl tracking-tighter">
                          {event.bookingsCount || 0} <span className="text-zinc-600 text-sm italic">/ {event.maxParticipants}</span>
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(((event.bookingsCount || 0) / event.maxParticipants) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons - Jetzt kompakter & stylischer */}
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="p-4 bg-zinc-800/50 hover:bg-white hover:text-black rounded-2xl transition-all group/btn"
                        title="Ansehen"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/edit-event/${event.id}`)}
                        className="flex-1 py-4 bg-zinc-800/50 hover:bg-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                      >
                        <Edit3 size={16} />
                        Bearbeiten
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="p-4 bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all"
                        title="Löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}