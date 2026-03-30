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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={50} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-2xl font-bold">Event nicht gefunden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-gray-400 hover:text-white font-medium transition-all group"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" /> 
          Zurück zur Übersicht
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
          {/* Hero Image */}
          <div className="relative h-[520px]">
            <img 
              src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200'} 
              className="w-full h-full object-cover" 
              alt={event.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

            {/* Category & Edit Button */}
            <div className="absolute top-8 left-8 flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl text-sm font-bold uppercase tracking-widest border border-white/20">
                {event.category || 'Event'}
              </div>
              
              {canEdit && (
                <button 
                  onClick={() => navigate(`/edit-event/${event.id}`)}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-5 py-2 rounded-2xl font-medium transition-all border border-white/20"
                >
                  <Pencil size={18} />
                  Bearbeiten
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="relative -mt-12 bg-zinc-900 rounded-t-3xl p-10 md:p-12 border-t border-zinc-700">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-800/50 backdrop-blur-md rounded-3xl p-6 border border-zinc-700">
                <CalendarDays className="text-violet-400 mb-3" size={28} />
                <p className="text-sm text-gray-400">Datum & Uhrzeit</p>
                <p className="font-semibold text-lg mt-1">
                  {new Date(event.startDate).toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-violet-400">
                  {new Date(event.startDate).toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} – {new Date(event.endDate).toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              <div className="bg-zinc-800/50 backdrop-blur-md rounded-3xl p-6 border border-zinc-700">
                <MapPin className="text-violet-400 mb-3" size={28} />
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-semibold text-lg mt-1">{event.location}</p>
              </div>

              <div className="bg-zinc-800/50 backdrop-blur-md rounded-3xl p-6 border border-zinc-700">
                <Users className="text-violet-400 mb-3" size={28} />
                <p className="text-sm text-gray-400">Kapazität</p>
                <p className="font-semibold text-lg mt-1">
                  Max. {event.maxParticipants.toLocaleString('de-DE')} Teilnehmer
                </p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-12">
              <p className="text-lg leading-relaxed text-gray-300 whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Booking Button */}
            {booked ? (
              <div className="w-full py-6 bg-emerald-600/20 border border-emerald-500 text-emerald-400 rounded-3xl flex items-center justify-center gap-4 font-semibold text-xl">
                <CheckCircle2 size={32} />
                Du bist bereits angemeldet!
              </div>
            ) : (
              <button 
                onClick={handleBooking} 
                disabled={booking} 
                className="w-full py-7 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:brightness-110 text-white rounded-3xl font-black text-2xl tracking-wider transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xl shadow-violet-500/50"
              >
                {booking ? (
                  <Loader2 className="animate-spin mx-auto" size={32} />
                ) : (
                  'JETZT TICKET SICHERN'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}