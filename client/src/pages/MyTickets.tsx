import { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Loader2, ArrowLeft, QrCode } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface BookedEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<BookedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/bookings/my-tickets');
        setTickets(res.data.bookings || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={28} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl">
              <Ticket size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white">Meine Tickets</h1>
              <p className="text-gray-400 text-xl mt-1">Deine gebuchten Veranstaltungen</p>
            </div>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center">
            <div className="mx-auto w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <Ticket size={48} className="text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Noch keine Tickets</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Du hast bisher noch keine Events gebucht.<br />
              Entdecke spannende Veranstaltungen und sichere dir dein Ticket!
            </p>
            <button 
              onClick={() => navigate('/events')}
              className="bg-white text-black px-10 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all"
            >
              Events entdecken →
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {tickets.map((event) => (
              <div 
                key={event.id} 
                className="bg-zinc-900 border border-zinc-800 hover:border-violet-500/30 rounded-3xl overflow-hidden transition-all group"
              >
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Bild */}
                  <div className="lg:w-96 relative">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                      alt={event.title}
                      className="w-full h-80 lg:h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 bg-violet-600/80 backdrop-blur-md text-white text-xs font-bold px-5 py-2 rounded-2xl">
                      GEBUCHT
                    </div>
                  </div>

                  {/* Hauptinhalt */}
                  <div className="flex-1 p-8 lg:p-12 flex flex-col">
                    <h2 className="text-4xl font-black tracking-tight text-white mb-6 group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </h2>

                    <div className="space-y-6 mb-12 text-gray-300">
                      <div className="flex items-center gap-4">
                        <Calendar size={26} className="text-violet-400" />
                        <div>
                          <p className="text-lg font-medium">
                            {new Date(event.startDate).toLocaleDateString('de-DE', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(event.startDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – 
                            {new Date(event.endDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <MapPin size={26} className="text-violet-400" />
                        <p className="text-lg font-medium">{event.location}</p>
                      </div>
                    </div>

                    {/* Dezenter QR-Code Bereich */}
                    <div className="mt-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
                      <div className="bg-white/95 p-4 rounded-2xl mb-4 shadow-inner">
                        <QrCode size={110} className="text-zinc-900" />   {/* dezent & etwas kleiner */}
                      </div>
                      <p className="text-xs text-gray-500 text-center tracking-widest">
                        TICKET-ID • #{event.id.toString().padStart(6, '0')}
                      </p>
                      <p className="text-sm text-gray-400 text-center mt-1">
                        Zeige diesen QR-Code beim Einlass
                      </p>
                    </div>

                    {/* Button */}
                    <button 
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="mt-8 w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-lg rounded-2xl hover:brightness-110 transition-all"
                    >
                      Event Details ansehen
                    </button>
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