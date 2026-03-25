import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Loader2, CheckCircle2, ArrowLeft, Pencil, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

interface EventDetailType {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  maxParticipants: number;
  category?: string;
  organizerId: number;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);


  const canEdit = user && (user.role === 'admin' || user.id === event?.organizerId);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/events/${id}`);
        const eventData = res.data.event || res.data;
        setEvent(eventData);

        if (res.data.isBooked) {
          setBooked(true);
        }
      } catch (err) {
        console.error("Fehler beim Laden des Events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setBooking(true);
      await api.post(`/bookings/${id}`);
      setBooked(true);
      alert("Erfolgreich gebucht! 🎟️");
    } catch (err) {
      let errorMessage = "Buchung fehlgeschlagen.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.response?.data?.message || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center p-20 font-bold text-xl text-gray-600">
        Event nicht gefunden.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
    
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Zurück zur Übersicht
        </button>

        {canEdit && (
          <button 
            onClick={() => navigate(`/events/edit/${event.id}`)}
            className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-yellow-200 transition-all border border-yellow-200 shadow-sm"
          >
            <Pencil size={18} />
            Event bearbeiten
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-50">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'} 
          className="w-full h-[400px] object-cover" 
          alt={event.title} 
        />
        
        <div className="p-12">
          <div className="flex justify-between items-start mb-6">
             <h1 className="text-4xl font-black tracking-tighter">{event.title}</h1>
             <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
                {event.category || 'Event'}
             </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl">
              <CalendarDays className="text-blue-600 mt-1" size={24} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Datum & Zeit
                </p>
                <p className="font-bold text-lg">
                  {new Date(event.startDate).toLocaleDateString('de-DE')} •{' '}
                  {new Date(event.startDate).toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} Uhr
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl">
              <MapPin className="text-blue-600 mt-1" size={24} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Location
                </p>
                <p className="font-bold text-lg">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl md:col-span-2">
              <Users className="text-blue-600 mt-1" size={24} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Kapazität
                </p>
                <p className="font-bold text-lg">
                  Max. {event.maxParticipants.toLocaleString('de-DE')} Teilnehmer
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-12 text-lg whitespace-pre-line">
            {event.description}
          </p>

          {booked ? (
            <div className="w-full py-6 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center gap-3 font-black uppercase border border-green-200">
              <CheckCircle2 size={24} /> Du bist bereits angemeldet!
            </div>
          ) : (
            <button 
              onClick={handleBooking} 
              disabled={booking} 
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? (
                <Loader2 className="animate-spin mx-auto" size={28} />
              ) : (
                'JETZT TICKET SICHERN'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}