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
  const [filtering, setFiltering] = useState(false);
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

  // Sofortige und performante Filterung
  const filteredEvents = useMemo(() => {
    setFiltering(true);
    
    const result = events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Alle' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    setTimeout(() => setFiltering(false), 150);
    return result;
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
              Entdecke <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Events</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
              Finde dein nächstes unvergessliches Erlebnis
            </p>
          </div>

          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button 
              onClick={() => navigate('/create-event')}
              className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-4 rounded-3xl font-semibold text-lg shadow-xl shadow-violet-500/30 transition-all active:scale-95"
            >
              <PlusCircle size={24} />
              Event erstellen
            </button>
          )}
        </div>

        {/* Suche & Filter – Jetzt mit guter Lesbarkeit */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          
          {/* Suchfeld */}
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={22} />
            <input 
              type="text"
              placeholder="Event oder Ort suchen..."
              className="w-full pl-14 pr-6 py-4 
                         bg-white dark:bg-zinc-900 
                         border border-gray-200 dark:border-zinc-700 
                         rounded-3xl 
                         focus:outline-none focus:ring-2 focus:ring-violet-500 
                         text-lg 
                         text-gray-900 dark:text-white 
                         placeholder:text-gray-400 dark:placeholder:text-zinc-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Kategorie-Filter */}
          <div className="relative min-w-[240px]">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={22} />
            <select 
              className="w-full pl-14 pr-10 py-4 
                         bg-white dark:bg-zinc-900 
                         border border-gray-200 dark:border-zinc-700 
                         rounded-3xl 
                         focus:outline-none focus:ring-2 focus:ring-violet-500 
                         text-lg 
                         text-gray-900 dark:text-white 
                         cursor-pointer appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option 
                  key={cat} 
                  value={cat}
                  className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white py-2"
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter-Feedback */}
        {filtering && (
          <div className="mb-6 flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium">
            <Loader2 className="animate-spin" size={18} />
            Filter wird angewendet...
          </div>
        )}

        {/* Events Anzeige */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-600 mb-4" size={56} />
            <p className="text-gray-500 font-semibold text-lg">Events werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center font-medium">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800">
                <p className="text-2xl text-gray-400 font-medium">
                  Keine Events für diese Auswahl gefunden.
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 dark:border-zinc-800"
                >
                  {/* Bild mit Overlay */}
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-5 left-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest text-violet-600 shadow">
                      {event.category}
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-5 right-5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2 rounded-2xl text-center shadow">
                      <p className="text-xs font-black text-gray-500">AB</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
                        {new Date(event.startDate).toLocaleDateString('de-DE', { day: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2 group-hover:text-violet-600 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <CalendarDays size={20} className="text-violet-500" />
                        <span className="font-medium">{formatDateTimeDisplay(event.startDate, event.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-violet-500" />
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users size={20} className="text-violet-500" />
                        <span className="font-medium">Bis zu {event.maxParticipants.toLocaleString('de-DE')} Personen</span>
                      </div>
                    </div>

                    <button 
                      className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-violet-500/30 group-hover:shadow-xl transition-all active:scale-95"
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