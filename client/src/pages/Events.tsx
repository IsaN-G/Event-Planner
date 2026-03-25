import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  CalendarDays, 
  Users, 
  Loader2, 
  Trash2, 
  Clock 
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
  organizerId: number;
}

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatDateTimeDisplay = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">
            {start.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
          </span>
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <Clock size={12} /> 
            {start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} 
            - {end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <span className="font-bold text-gray-900">
          {start.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} 
          - {end.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
        </span>
        <span className="text-xs text-blue-500 font-black uppercase">Mehrtägig</span>
      </div>
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Event wirklich löschen?")) return;
    
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen des Events");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="relative bg-slate-900 h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000')] bg-cover bg-center" />
        
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white tracking-tighter mb-6 italic uppercase">
            Explore.
          </h1>


          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button 
              onClick={() => navigate('/create-event')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 mx-auto shadow-xl transition-all"
            >
              <PlusCircle size={24} /> Event planen
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
  
        {error && (
          <div className="mb-10 p-5 bg-red-50 border-l-8 border-red-500 text-red-700 rounded-r-2xl flex items-center gap-4 shadow-sm">
            <div>
              <p className="font-bold text-sm uppercase">Fehler</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">
                Noch keine Events vorhanden.
              </p>
            ) : (
              events.map(event => (
                <div 
                  key={event.id} 
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col relative"
                >
                  {(user?.role === 'admin' || user?.id === event.organizerId) && (
                    <button 
                      onClick={() => handleDelete(event.id)} 
                      className="absolute top-4 right-4 z-20 p-2 bg-white/90 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={event.title} 
                    />
                  </div>

                  <div className="p-8 flex-grow">
                    <div className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">
                      {event.category}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 line-clamp-2">{event.title}</h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 text-sm text-gray-500">
                        <CalendarDays size={18} className="text-blue-500 mt-1" />
                        {formatDateTimeDisplay(event.startDate, event.endDate)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <MapPin size={18} className="text-blue-500" /> 
                        {event.location}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Users size={18} className="text-blue-500" /> 
                        Max. {event.maxParticipants.toLocaleString('de-DE')} Personen
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/events/${event.id}`)} 
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
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