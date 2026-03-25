import { useState, useEffect } from 'react';
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

  // States für Suche und Filter
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

  // Filter-Logik
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Alle' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
  
    // Jetzt wird endStr (via endTime) benutzt!
    return `${date} | ${startTime} - ${endTime} Uhr`;
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header-Bereich */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
              Entdecke <span className="text-blue-600">Events</span>
            </h1>
            <p className="text-gray-500 font-medium">Finde spannende Erlebnisse in deiner Umgebung.</p>
          </div>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button 
              onClick={() => navigate('/create-event')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <PlusCircle size={20} /> Event erstellen
            </button>
          )}
        </div>

        {/* Such- und Filterleiste */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Nach Titel oder Ort suchen..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 font-medium outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              className="w-full pl-12 pr-10 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 appearance-none cursor-pointer outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold">Events werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Keine Events gefunden, die deiner Suche entsprechen.</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  {/* Bild-Bereich */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                      {event.category}
                    </div>
                  </div>
                  
                  {/* Content-Bereich */}
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-4 line-clamp-2 text-gray-900">{event.title}</h3>

                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-start gap-3 text-sm text-gray-500 font-medium">
                        <CalendarDays size={18} className="text-blue-500 shrink-0" />
                        {formatDateTimeDisplay(event.startDate, event.endDate)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                        <MapPin size={18} className="text-blue-500 shrink-0" /> 
                        {event.location}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                        <Users size={18} className="text-blue-500 shrink-0" /> 
                        Max. {event.maxParticipants.toLocaleString('de-DE')} Personen
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/events/${event.id}`)} 
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200"
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