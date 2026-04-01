import { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Users, 
  Search,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface EventType {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  maxParticipants: number;
  imageUrl?: string;
}

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  const vibes: Record<string, string> = {
    Alle: "Finde dein nächstes unvergessliches Erlebnis",
    Party: "Die Nacht gehört uns! Fette Beats & kühle Drinks.",
    Sport: "Zeit an die Grenzen zu gehen! Pure Leidenschaft.",
    Kultur: "Inspiration pur. Tauche ein in neue Welten.",
    Workshop: "Upgrade your Skills! Lerne von den Besten.",
    Gaming: "Level Up! Messe dich mit den Besten.",
    Chill: "Deep Vibes Only. Lockere Gespräche.",
    Food: "Ein Fest für die Sinne. Neue Geschmackswelten.",
    Outdoor: "Ab nach draußen! Das nächste große Abenteuer.",
  };

  const categories = ['Alle', 'Party', 'Sport', 'Kultur', 'Workshop', 'Gaming', 'Chill', 'Food', 'Outdoor'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/events');
      const data = response.data.events || response.data;
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError('Events konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  const formatDateTimeDisplay = (startStr: string) => {
    const start = new Date(startStr);
    return start.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-violet-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-violet-600/10 blur-[120px] rounded-full opacity-40" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
              Explore <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Events</span>
            </h1>
            <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.4em] bg-zinc-900/50 w-fit px-4 py-2 rounded-full border border-zinc-800/50">
              {vibes[selectedCategory] || vibes['Alle']}
            </p>
          </div>

          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button onClick={() => navigate('/create-event')} className="flex items-center gap-3 bg-white text-black hover:bg-violet-600 hover:text-white px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 group">
              <PlusCircle size={18} /> Event erstellen
            </button>
          )}
        </div>

        {/* NEW WOW-CATEGORY-FILTER (Pills statt Dropdown) */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                selectedCategory === cat 
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SEARCH BAR (Jetzt ganz clean) */}
        <div className="relative mb-16 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Nach Titel oder Ort suchen..." 
            className="w-full pl-16 pr-8 py-5 bg-zinc-900/20 border border-zinc-800/50 rounded-[24px] focus:outline-none focus:border-violet-500/50 focus:bg-zinc-900/40 text-sm font-bold text-white placeholder:text-zinc-700 uppercase tracking-widest transition-all backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ERROR / LOADING / GRID */}
        {error && (
          <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center gap-4 text-red-500">
            <AlertCircle size={20} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => navigate(`/events/${event.id}`)}
                className="group relative bg-zinc-900/20 border border-zinc-800/50 hover:border-violet-500/50 rounded-[40px] overflow-hidden transition-all duration-500 cursor-pointer flex flex-col h-[440px]"
              >
                <div className="relative h-[55%] overflow-hidden">
                  <img src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0" alt="img" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-90" />
                </div>

                <div className="p-8 flex flex-col justify-between flex-1 relative z-10 -mt-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-violet-500/20 italic">
                        {event.category}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{formatDateTimeDisplay(event.startDate)}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-[1.1] uppercase italic tracking-tighter group-hover:text-violet-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-zinc-800/50">
                    <div className="flex items-center gap-4 text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><Users size={12} className="text-violet-500" /> {event.maxParticipants}</div>
                      <div className="flex items-center gap-1.5 line-clamp-1 max-w-[90px]"><MapPin size={12} className="text-violet-500" /> {event.location}</div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800/50 flex items-center justify-center group-hover:bg-violet-600 transition-all shadow-lg">
                      <ArrowRight size={16} className="text-white" />
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