import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Edit3, 
  Trash2, 
  
  PlusCircle, 
  Loader2, 
  CalendarDays, 
  MapPin, 
  ExternalLink,
  AlertCircle
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
        setMyEvents(response.data.events || []);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4 rounded-2xl">
              <LayoutDashboard size={36} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">Organizer Dashboard</h1>
              <p className="text-gray-400 text-lg mt-1">Verwalte deine Veranstaltungen und Buchungen</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/create-event')}
            className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 px-8 py-4 rounded-3xl font-semibold text-lg shadow-xl shadow-violet-500/30 transition-all active:scale-95"
          >
            <PlusCircle size={24} />
            Neues Event erstellen
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 p-5 rounded-3xl flex items-center gap-4 mb-10">
            <AlertCircle size={24} className="text-red-400" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-violet-500 mb-6" size={60} />
            <p className="text-gray-400 text-xl font-medium">Deine Events werden geladen...</p>
          </div>
        ) : myEvents.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center">
            <div className="mx-auto w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <CalendarDays size={40} className="text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Noch keine Events</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Du hast bisher noch keine Veranstaltungen erstellt. Starte jetzt!
            </p>
            <button 
              onClick={() => navigate('/create-event')}
              className="bg-white text-black px-10 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all"
            >
              Erstes Event erstellen →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {myEvents.map(event => (
              <div 
                key={event.id} 
                className="group bg-zinc-900 border border-zinc-800 hover:border-violet-500/40 rounded-3xl overflow-hidden transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Linke Seite: Bild + Kategorie */}
                  <div className="lg:w-96 relative">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                      className="w-full h-80 lg:h-full object-cover"
                      alt={event.title}
                    />
                    <div className="absolute top-6 left-6">
                      <div className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-2xl shadow-lg max-w-[220px] truncate">
                        {event.category}
                      </div>
                    </div>
                  </div>

                  {/* Rechte Seite: Inhalt */}
                  <div className="flex-1 p-8 lg:p-10 flex flex-col">
                    <h3 className="text-3xl font-black tracking-tight mb-6 leading-tight group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-4 mb-8 text-gray-300">
                      <div className="flex items-start gap-4">
                        <CalendarDays size={22} className="text-violet-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {new Date(event.startDate).toLocaleDateString('de-DE', { 
                              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(event.startDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – 
                            {new Date(event.endDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <MapPin size={22} className="text-violet-400 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>

                    {/* Buchungsfortschritt */}
                    <div className="mt-auto">
                      <div className="flex justify-between text-sm mb-2 text-gray-400">
                        <span>Buchungen</span>
                        <span className="font-semibold text-white">
                          {event.bookingsCount || 0} / {event.maxParticipants}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(((event.bookingsCount || 0) / event.maxParticipants) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-10">
                      <button 
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <ExternalLink size={20} />
                        Ansehen
                      </button>
                      <button 
                        onClick={() => navigate(`/edit-event/${event.id}`)}
                        className="flex-1 py-4 bg-zinc-800 hover:bg-violet-950 hover:text-violet-400 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Edit3 size={20} />
                        Bearbeiten
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 py-4 bg-zinc-800 hover:bg-red-950 hover:text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Trash2 size={20} />
                        Löschen
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