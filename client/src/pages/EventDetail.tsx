import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, ArrowLeft, Loader2, Send, 
  Trash2, Map as MapIcon, CheckCircle, Clock, Edit3
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';

// Interfaces
interface EventDetailType {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  maxParticipants: number;
  imageUrl?: string;
  status?: string; 
  organizerId: number;
  agenda?: any; 
  lat?: number;
  lng?: number;
}

interface Participant {
  id: number;
  User: {
    id: number;
    username: string;
  };
}

interface Message {
  id: number | string;
  content: string;
  userId: string | number;
  type: 'public' | 'host';
  sender: { id: number | string; username: string; };
}

// Leaflet Icon Fix
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChatTab, setActiveChatTab] = useState<'public' | 'host'>('public');
  const [isEventStarted, setIsEventStarted] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedAgenda, setEditedAgenda] = useState("");
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bottomTab, setBottomTab] = useState<'map' | 'users' | 'info'>('map');
  const [isJoined, setIsJoined] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState({ Tage: 0, Std: 0, Min: 0, Sek: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventId = Number(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, partRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/bookings/event/${id}`)
        ]);

        const eventData = eventRes.data.event || eventRes.data;
        setEvent(eventData);
        setEditedDescription(eventData.description || "");
        
        // Editor-Vorbereitung: Verhindert Absturz beim Öffnen des Modals
        if (Array.isArray(eventData.agenda)) {
          setEditedAgenda(eventData.agenda.join('\n'));
        } else if (typeof eventData.agenda === 'string' && eventData.agenda.trim() !== "") {
           setEditedAgenda(eventData.agenda);
        } else {
          setEditedAgenda("");
        }

        setIsEventStarted(eventData.status === 'active');
        
        const partData = partRes.data || [];
        setParticipants(partData);
        setIsJoined(partData.some((p: Participant) => String(p.User?.id) === String(user?.id)));
        
      } catch (err) { 
        console.error("Fehler beim Laden:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [id, user?.id]);

  useEffect(() => {
    if (!event) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(event.startDate).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ Tage: 0, Std: 0, Min: 0, Sek: 0 });
        return;
      }

      setTimeLeft({
        Tage: Math.floor(distance / (1000 * 60 * 60 * 24)),
        Std: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        Min: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        Sek: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (!eventId) return;
    socket.connect();
    socket.emit("joinEvent", eventId);
    
    socket.on("newMessage", (msg: Message) => setMessages(prev => [...prev, msg]));
    socket.on("messageDeleted", (deletedId: string | number) => {
      setMessages(prev => prev.filter(m => m.id !== deletedId));
    });

    api.get(`/chat/${eventId}`).then(res => setMessages(res.data.messages || []));

    return () => { 
      socket.off("newMessage"); 
      socket.off("messageDeleted");
      socket.disconnect(); 
    };
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatTab]);

  const handleJoinEvent = async () => {
    try {
      await api.post(`/bookings/${id}`);
      const res = await api.get(`/bookings/event/${id}`);
      setParticipants(res.data);
      setIsJoined(true);
    } catch {
      alert("Fehler beim Beitreten.");
    }
  };

  const handleStartEvent = async () => {
    if (!event || isEventStarted) return;
    try {
      await api.patch(`/events/${id}/status`, { status: 'active' });
      setIsEventStarted(true);
      socket.emit("sendMessage", { 
        eventId, 
        content: "🚀 Das Event wurde offiziell gestartet!", 
        userId: user?.id, 
        username: "SYSTEM",
        type: 'public'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDetails = async () => {
    try {
      const agendaArray = editedAgenda.split('\n').filter(line => line.trim() !== "");
      await api.put(`/events/${id}`, { 
        description: editedDescription,
        agenda: agendaArray 
      });
      setEvent(prev => prev ? { ...prev, description: editedDescription, agenda: agendaArray } : null);
      setIsEditModalOpen(false);
    } catch  {
      alert("Fehler beim Speichern.");
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    socket.emit("sendMessage", { 
      eventId, 
      content: newMessage.trim(), 
      userId: user.id, 
      username: user.username,
      type: activeChatTab 
    });
    setNewMessage('');
  };

  const sendQuickEmoji = (emoji: string) => {
    if (!user) return;
    socket.emit("sendMessage", { 
      eventId, 
      content: emoji, 
      userId: user.id, 
      username: user.username,
      type: activeChatTab 
    });
  };

  const handleDeleteMessage = async (msgId: string | number) => {
    if (!window.confirm("Nachricht wirklich löschen?")) return;
    try {
      await api.delete(`/chat/message/${msgId}`);
      socket.emit("deleteMessage", { eventId, messageId: msgId });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="animate-spin text-violet-500" size={48} /></div>;
  if (!event) return <div className="min-h-screen bg-[#09090b] text-white p-10 text-center">Event nicht gefunden.</div>;

  const filteredMessages = messages.filter(m => m.type === activeChatTab);
  const isHost = Number(user?.id) === Number(event.organizerId) || user?.role === 'admin';
  const progressPercent = Math.min((participants.length / event.maxParticipants) * 100, 100);

  // --- DIE ULTIMATIVE AGENDA LOGIK (FEHLERSICHER) ---
  const getAgendaItems = (): string[] => {
    if (!event.agenda) return [];
    
    // Fall 1: Es ist bereits ein Array
    if (Array.isArray(event.agenda)) return event.agenda;
    
    // Fall 2: Es ist ein String (entweder JSON-String oder reiner Text)
    if (typeof event.agenda === 'string') {
      try {
        const parsed = JSON.parse(event.agenda);
        if (Array.isArray(parsed)) return parsed;
        return [event.agenda];
      } catch {
        // Fall 3: Reiner Text mit Zeilenumbrüchen
        return event.agenda.split('\n').filter(item => item.trim() !== "");
      }
    }
    return [];
  };

  const agendaItems = getAgendaItems();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-violet-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm font-medium">Zurück</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:h-[850px]">
          
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            <div className="flex gap-4 bg-zinc-900/30 w-fit p-3 rounded-2xl border border-zinc-800/50">
              {Object.entries(timeLeft).map(([label, value]) => (
                <div key={label} className="text-center min-w-[42px]">
                  <div className="text-xl font-black text-violet-500 tabular-nums leading-none mb-1">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-[8px] uppercase font-bold text-zinc-600 tracking-tighter">{label}</div>
                </div>
              ))}
            </div>

            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{event.title}</h1>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl">
                <div className="text-zinc-500 text-[10px] uppercase font-black mb-2 flex items-center gap-2 tracking-widest"><Calendar size={12}/> Datum</div>
                <div className="font-bold text-sm">{new Date(event.startDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl">
                <div className="text-zinc-500 text-[10px] uppercase font-black mb-2 flex items-center gap-2 tracking-widest"><Users size={12}/> Plätze</div>
                <div className="font-bold text-sm">{participants.length.toLocaleString()} / {event.maxParticipants.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl">
              <div className="text-zinc-500 text-[10px] uppercase font-black mb-2 flex items-center gap-2 tracking-widest"><MapPin size={12}/> Ort</div>
              <div className="font-bold text-sm">{event.location}</div>
            </div>

            <div className="relative bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-[32px] text-zinc-400 text-sm leading-relaxed group flex-1 overflow-y-auto custom-scrollbar">
              {isHost && (
                <button onClick={() => setIsEditModalOpen(true)} className="absolute top-6 right-6 p-2.5 bg-zinc-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-600 hover:text-white border border-zinc-700 z-10">
                  <Edit3 size={16} />
                </button>
              )}
              <div className="whitespace-pre-line">{event.description}</div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6 h-full">
             <div className="relative aspect-square rounded-[48px] overflow-hidden border border-zinc-800 group shadow-2xl flex-shrink-0">
                <img src={event.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black border border-white/10 uppercase italic tracking-widest">Live View</div>
             </div>

             <div className="space-y-3 px-1 flex-shrink-0">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <span>Auslastung</span>
                  <span className={progressPercent >= 100 ? "text-red-500" : "text-violet-400"}>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[1.5px]">
                  <div className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
             </div>

             <button onClick={handleStartEvent} disabled={isEventStarted} className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-xs flex-shrink-0 ${isEventStarted ? 'bg-emerald-600 text-white cursor-default' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/30'}`}>
               {isEventStarted ? <><CheckCircle size={20} /> Event ist Live</> : 'Event jetzt starten'}
             </button>

             <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0">
                <div className="flex border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
                  <button onClick={() => setBottomTab('map')} className={`flex-1 py-4 flex justify-center transition-all ${bottomTab === 'map' ? 'text-violet-500 bg-zinc-800/30 border-r border-zinc-800' : 'text-zinc-500 border-r border-zinc-800 hover:text-white'}`}><MapIcon size={20}/></button>
                  <button onClick={() => setBottomTab('users')} className={`flex-1 py-4 flex justify-center border-r border-zinc-800 transition-all ${bottomTab === 'users' ? 'text-violet-500 bg-zinc-800/30' : 'text-zinc-500 border-r border-zinc-800 hover:text-white'}`}><Users size={20}/></button>
                  <button onClick={() => setBottomTab('info')} className={`flex-1 py-4 flex justify-center transition-all ${bottomTab === 'info' ? 'text-violet-500 bg-zinc-800/30' : 'text-zinc-500 hover:text-white'}`}><Clock size={20}/></button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar min-h-0">
                   {bottomTab === 'map' && (
                     <div className="h-full rounded-2xl overflow-hidden shadow-inner">
                        <MapContainer center={[event.lat || 53.5511, event.lng || 9.9937]} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                           <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                           <Marker position={[event.lat || 53.5511, event.lng || 9.9937]} />
                        </MapContainer>
                     </div>
                   )}
                   {bottomTab === 'users' && (
                     <div className="space-y-5">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Teilnehmer ({participants.length})</p>
                           {participants.map(p => (
                             <div key={p.id} className="flex items-center gap-3 text-xs bg-zinc-800/30 p-3 rounded-2xl border border-zinc-800/50">
                               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[9px] font-black text-white uppercase">{p.User?.username?.substring(0,2) || "U"}</div>
                               <span className="font-bold">{p.User?.username || "Gast"}</span>
                             </div>
                           ))}
                        </div>
                        {!isJoined && (
                          <button onClick={handleJoinEvent} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-zinc-200 transition-all shadow-xl tracking-widest">Jetzt beitreten</button>
                        )}
                        {isJoined && (
                          <div className="w-full py-3 bg-zinc-800/50 text-zinc-500 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-zinc-800 tracking-widest">
                            <CheckCircle size={14} /> Angemeldet
                          </div>
                        )}
                     </div>
                   )}
                   {bottomTab === 'info' && (
                     <div className="space-y-6">
                        {agendaItems && agendaItems.length > 0 ? (
                          <div className="relative pl-8 border-l border-zinc-800 space-y-8 py-2">
                            {agendaItems.map((line, index) => (
                              <div key={index} className="relative">
                                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-[#09090b] border-2 border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]" />
                                <p className="text-xs font-medium text-zinc-300 leading-snug">{line}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-3">
                             <Clock size={32} strokeWidth={1} />
                             <span className="text-[10px] uppercase font-black tracking-widest italic">Kein Zeitplan</span>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 h-full">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[48px] h-full flex flex-col overflow-hidden backdrop-blur-2xl shadow-2xl">
              <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Live Chat</h3>
                </div>
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                  {isHost && (
                    <button onClick={() => setActiveChatTab('host')} className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeChatTab === 'host' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}> Host </button>
                  )}
                  <button onClick={() => setActiveChatTab('public')} className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeChatTab === 'public' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}> Public </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar min-h-0">
                {filteredMessages.map((msg) => {
                  const isMe = String(msg.sender?.id || msg.userId) === String(user?.id);
                  return (
                    <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center text-[10px] font-black uppercase text-zinc-400">
                        {msg.sender?.username?.substring(0,2) || "U"}
                      </div>
                      <div className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <span className="text-[10px] font-black text-zinc-600 uppercase mb-1.5 tracking-widest">{msg.sender?.username || "Unbekannt"}</span>
                        <div className={`px-5 py-3 rounded-[24px] text-sm leading-relaxed ${isMe ? 'bg-violet-600 text-white rounded-tr-none shadow-xl shadow-violet-500/10' : 'bg-zinc-800/50 text-zinc-200 rounded-tl-none border border-zinc-800'}`}>
                          {msg.content}
                        </div>
                        {(isMe || user?.role === 'admin') && (
                          <button onClick={() => handleDeleteMessage(msg.id)} className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-xl transition-all hover:scale-110 shadow-xl border border-red-400"><Trash2 size={12} /></button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-8 py-4 flex flex-wrap gap-2.5 border-t border-zinc-800/50 bg-zinc-900/40">
                {['🔥', '❤️', '👏', '🙌', '🚀', '✨', '🥳', '🎸', '⚡', '💣', '🎉', '🤩'].map(emoji => (
                  <button key={emoji} onClick={() => sendQuickEmoji(emoji)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-800/40 hover:bg-zinc-700 transition-all active:scale-90 text-lg border border-zinc-700/30">
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-8 bg-zinc-950/40 border-t border-zinc-800">
                <div className="relative flex items-center group">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Schreibe eine Nachricht..." className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-violet-500 transition-all placeholder:text-zinc-600" />
                  <button type="submit" className="absolute right-3 p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-all" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter text-white">Event Details bearbeiten</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-3 mb-2 block tracking-[0.2em]">Beschreibung</label>
                <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-sm text-zinc-300 focus:border-violet-500 outline-none transition-all resize-none custom-scrollbar" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-3 mb-2 block tracking-[0.2em]">Zeitplan (Agenda) - Jede Zeile ein Punkt</label>
                <textarea value={editedAgenda} onChange={(e) => setEditedAgenda(e.target.value)} className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-sm text-zinc-300 focus:border-violet-500 outline-none transition-all font-mono resize-none custom-scrollbar" placeholder="18:00 - Einlass&#10;19:00 - Start" />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-zinc-800 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-colors border border-zinc-700">Abbrechen</button>
              <button onClick={handleSaveDetails} className="flex-1 py-4 rounded-2xl bg-violet-600 font-black text-[10px] uppercase tracking-widest hover:bg-violet-500 transition-all shadow-xl shadow-violet-500/20">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}