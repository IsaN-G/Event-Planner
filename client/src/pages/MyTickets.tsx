import { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 

  ArrowLeft, 
  QrCode, 
  ExternalLink, 
  Share2 
} from 'lucide-react';
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

  const handleShare = async (event: BookedEvent) => {
    const shareData = {
      title: event.title,
      text: `Hey, ich bin bei ${event.title} dabei! Schau es dir an:`,
      url: `${window.location.origin}/events/${event.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch  {
        console.log('Teilen abgebrochen');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link in die Zwischenablage kopiert! Du kannst ihn jetzt im Chat teilen.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] py-16 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-6 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Zurück
            </button>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
              Your <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Passes</span>
            </h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mt-2">
              Verwalte deine digitalen Zugänge
            </p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Ticket className="text-violet-500" size={20} />
            <span className="text-white font-black text-xl tracking-tighter">{tickets.length}</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Aktiv</span>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl rounded-[40px] p-20 text-center border-dashed">
            <div className="mx-auto w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-8 border border-zinc-700 text-zinc-600">
              <Ticket size={32} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Keine Tickets am Start</h2>
            <p className="text-zinc-500 font-medium mb-10 max-w-sm mx-auto uppercase text-[10px] tracking-[0.2em] leading-loose">
              Dein Wallet ist aktuell leer. Zeit für dein nächstes Event!
            </p>
            <button 
              onClick={() => navigate('/events')}
              className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-violet-500 hover:text-white transition-all shadow-2xl"
            >
              Events entdecken
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {tickets.map((event) => (
              <div 
                key={event.id} 
                className="group relative flex flex-col md:flex-row bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] overflow-hidden hover:border-violet-500/50 transition-all duration-500"
              >
                {/* Visual Part (Bild) */}
                <div className="md:w-72 h-64 md:h-auto relative shrink-0">
                  <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
                    alt={event.title}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic">
                      Verifiziert • Pass
                    </span>
                  </div>
                </div>

                {/* Ticket Info Part */}
                <div className="flex-1 p-10 flex flex-col justify-center">
                   <div className="flex items-center gap-2 text-violet-400 mb-4">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                         {new Date(event.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                   </div>
                  
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-6 group-hover:text-violet-400 transition-colors">
                    {event.title}
                  </h2>

                  <div className="flex items-center gap-4 text-zinc-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-700" />
                      <span className="text-[10px] font-bold uppercase tracking-widest line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="mt-8 flex items-center gap-2 text-white/50 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors"
                  >
                    Event-Details ansehen <ExternalLink size={12} />
                  </button>
                </div>

                {/* QR Code Section (The Stub / Abrisskante) */}
                <div className="md:w-64 bg-zinc-950/50 border-t md:border-t-0 md:border-l border-zinc-800/50 p-8 flex flex-col items-center justify-center relative">
                  
                  {/* Dekorative Perforation (Löcher) */}
                  <div className="hidden md:block absolute top-[-16px] left-[-16px] w-8 h-8 bg-[#09090b] rounded-full border border-zinc-800/50" />
                  <div className="hidden md:block absolute bottom-[-16px] left-[-16px] w-8 h-8 bg-[#09090b] rounded-full border border-zinc-800/50" />

                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-2xl mb-6 shadow-[0_0_40px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-all duration-500">
                    <QrCode size={100} className="text-black" strokeWidth={1.5} />
                  </div>
                  
                  {/* Share / Transfer Action */}
                  <div className="text-center w-full space-y-4">
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Pass Identity</p>
                      <p className="text-[10px] font-mono text-zinc-400">#PX-{event.id.toString().padStart(6, '0')}</p>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(event);
                      }}
                      className="w-full py-3 bg-zinc-800/50 hover:bg-violet-600 border border-zinc-700/50 hover:border-violet-400 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group/btn"
                    >
                      <Share2 size={12} className="text-zinc-400 group-hover/btn:text-white" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 group-hover/btn:text-white">Pass teilen</span>
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