import { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  CalendarDays, 
  Users, 
  Loader2, 
  Search,
  Filter
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

  const categories = [
    'Alle',
    'Firmenveranstaltungen',
    'Gesellschaftliche Veranstaltungen',
    'Kultur-/Unterhaltungsveranstaltungen',
    'Wohltätigkeitsveranstaltungen (Charity)',
    'Kinder-Event',
    'Allgemein'
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/events');
      const data = response.data.events || response.data;
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Die Events konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Alle' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  const formatDateTimeDisplay = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const date = start.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: 'long' 
    });
    
    const startTime = start.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  
    const endTime = end.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  
    return `${date} | ${startTime} - ${endTime} Uhr`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-white mb-3">
              Entdecke <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Events</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium">
              Finde dein nächstes unvergessliches Erlebnis
            </p>
          </div>

          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button 
              onClick={() => navigate('/create-event')}
              className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white px-8 py-4 rounded-3xl font-semibold text-lg shadow-xl shadow-violet-500/30 transition-all active:scale-95"
            >
              <PlusCircle size={24} />
              Event erstellen
            </button>
          )}
        </div>

        {/* Suche & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={22} />
            <input 
              type="text"
              placeholder="Event oder Ort suchen..."
              className="w-full pl-14 pr-6 py-4 bg-zinc-900 border border-zinc-700 rounded-3xl focus:outline-none focus:border-violet-500 text-lg text-white placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative min-w-[260px]">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={22} />
            <select 
              className="w-full pl-14 pr-10 py-4 bg-zinc-900 border border-zinc-700 rounded-3xl focus:outline-none focus:border-violet-500 text-lg text-white cursor-pointer appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-500 mb-4" size={56} />
            <p className="text-gray-400 font-semibold text-lg">Events werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950 text-red-400 p-8 rounded-3xl text-center font-medium">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-2xl text-gray-400 font-medium">
                  Keine Events für diese Auswahl gefunden.
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 rounded-3xl overflow-hidden shadow-1xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Bild - größerer Fokus */}
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-90 transition-transform duration-400"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest text-white border border-white/20">
                      {event.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-black text-white leading-tight mb-6 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-4 mb-auto text-gray-400 text-[15px]">
                      <div className="flex items-center gap-3">
                        <CalendarDays size={20} className="text-violet-500 shrink-0" />
                        <span>{formatDateTimeDisplay(event.startDate, event.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-violet-500 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users size={20} className="text-violet-500 flex-shrink-0" />
                        <span>Bis zu {event.maxParticipants.toLocaleString('de-DE')} Personen</span>
                      </div>
                    </div>

                    {/* Button mit Gradient, aber kleiner und dezenter */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                      }}
                      className="mt-8 w-full py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white font-semibold text-base rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:brightness-110 transition-all active:scale-[0.98]"
                    >
                      Details ansehen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}