import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Edit3, 
  Trash2, 
  Users, 
  PlusCircle, 
  Loader2, 
  CalendarDays, 
  MapPin, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

// Definition des Event-Typs, um 'any' zu vermeiden
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
  bookingsCount?: number; // Anzahl der Buchungen vom Backend
}

export default function Dashboard() {
  // Wir sagen React: myEvents ist eine Liste von Events
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        setError(''); // Fehler vor jedem Versuch zurücksetzen
        const response = await api.get('/events/me');
        
        // Nur setzen, wenn die Antwort erfolgreich war
        setMyEvents(response.data.events || []);
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        // Nur einen Error anzeigen, wenn es kein 404 (nicht gefunden) ist
        if (err.response?.status !== 404) {
          setError('Verbindung zum Server fehlgeschlagen.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchtest du dieses Event wirklich unwiderruflich löschen?')) {
      try {
        await api.delete(`/events/${id}`);
        // Sauberes Filtern des States nach dem Löschen
        setMyEvents(prev => prev.filter(e => e.id !== id));
      } catch (err: unknown) {
        console.error("Löschfehler:", err);
        alert('Löschen fehlgeschlagen.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-2xl">
                <LayoutDashboard size={32} />
              </div>
              Organizer <span className="text-blue-600">Dashboard</span>
            </h1>
            <p className="text-gray-500 font-medium text-lg italic ml-1">
              Verwalte deine Veranstaltungen und sieh dir die Buchungen an.
            </p>
          </div>
          <button 
            onClick={() => navigate('/create-event')}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            <PlusCircle size={20} /> Event erstellen
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 font-bold mb-8 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Content Bereich */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-400 font-bold">Lade deine Events...</p>
          </div>
        ) : myEvents.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-gray-200 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="text-gray-300" size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Noch keine Events</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
              Du hast bisher noch keine Veranstaltungen erstellt. Plane jetzt dein erstes Event!
            </p>
            <button 
              onClick={() => navigate('/create-event')}
              className="text-blue-600 font-black hover:underline underline-offset-8 transition-all"
            >
              Jetzt das erste Event erstellen →
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {myEvents.map(event => (
              <div key={event.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-8 hover:shadow-md transition-all group">
                
                {/* Bild-Vorschau */}
                <div className="relative shrink-0">
                  <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl object-cover shadow-inner bg-gray-100"
                    alt={event.title}
                  />
                  <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                    {event.category?.split(' ')[0] || 'Event'}
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex-1 space-y-2 text-center lg:text-left min-w-0">
                  <h3 className="text-2xl font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-5 text-sm text-gray-400 font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-blue-500" /> {new Date(event.startDate).toLocaleDateString('de-DE')}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500" /> {event.location}</span>
                  </div>
                </div>

                {/* Teilnehmer-Metrik mit dem Users-Icon */}
                <div className="bg-gray-50 px-8 py-4 rounded-[20px] border border-gray-100 min-w-[220px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center lg:justify-start gap-2">
                    <Users size={12} className="text-blue-500" /> Anmeldungen
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(((event.bookingsCount || 0) / event.maxParticipants) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-black text-gray-900 tabular-nums">
                      {event.bookingsCount || 0}<span className="text-gray-300 font-medium">/{event.maxParticipants}</span>
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
                    title="Event ansehen"
                  >
                    <ExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
                    title="Bearbeiten"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                    title="Löschen"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}