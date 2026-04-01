import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, MapPin, AlignLeft, Users, 
  Image as ImageIcon, Loader2, 
  X, Tag, Calendar, Music, Trophy, Sparkles, Euro, Clock, AlertCircle, Link as LinkIcon, Globe,
  Wand2, Gamepad2, Coffee, Utensils, Trees 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { AxiosError } from 'axios';

// --- TYPES & GLOBAL DECLARATIONS ---
interface CloudinaryResult {
  event: string;
  info: { secure_url: string; };
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (options: object, callback: (error: Error | null, result: CloudinaryResult) => void) => {
        open: () => void;
      };
    };
  }
}

// Leaflet Icon Fix
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.setView(coords, 13);
  return null;
}

const CATEGORIES = [
  { id: 'Party', icon: <Music size={16} />, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  { id: 'Sport', icon: <Trophy size={16} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'Kultur', icon: <Sparkles size={16} />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { id: 'Workshop', icon: <Tag size={16} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { id: 'Gaming', icon: <Gamepad2 size={16} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  { id: 'Chill', icon: <Coffee size={16} />, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { id: 'Food', icon: <Utensils size={16} />, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  { id: 'Outdoor', icon: <Trees size={16} />, color: 'text-lime-400', bg: 'bg-lime-400/10', border: 'border-lime-400/20' },
];

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 50,
    category: 'Party',
    price: 0,
    isFree: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isWidgetUpload, setIsWidgetUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); 
  const [submitError, setSubmitError] = useState('');
  const [mapCoords, setMapCoords] = useState<[number, number]>([52.52, 13.405]);
  const navigate = useNavigate();

  // HIER SIND DIE KI-ÄNDERUNGEN INTEGRIERT
  const generateAIDescription = async () => {
    if (!formData.title || formData.title.trim() === '') {
      setSubmitError("Bitte gib erst einen Titel ein, damit die KI weiß, worum es geht!");
      return;
    }
    
    setAiLoading(true);
    setSubmitError(''); 
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const templates = {
        Party: "Die Nacht gehört uns! Fette Beats, kühle Drinks und eine Stimmung, die man erleben muss.",
        Sport: "Zeit an die Grenzen zu gehen! Egal ob Profi oder Amateur, hier zählt die Leidenschaft.",
        Kultur: "Inspiration pur. Tauche ein in eine Welt voller Ästhetik und neuer Perspektiven.",
        Workshop: "Upgrade your Skills! Lerne praxisnah von Experten in motivierender Atmosphäre.",
        Gaming: "Level Up! Tauche ein in virtuelle Welten und messe dich mit den Besten.",
        Chill: "Deep Vibes Only. Entspann dich bei guter Musik und lockeren Gesprächen.",
        Food: "Ein Fest für die Sinne. Entdecke neue Geschmackswelten und kulinarische Highlights.",
        Outdoor: "Ab nach draußen! Frische Luft, Freiheit und das nächste große Abenteuer."
      };

      const selectedVibe = templates[formData.category as keyof typeof templates] || "Sei dabei!";
      
      const fullAiText = `✨ ${selectedVibe} ✨\n\n` +
        `Mach dich bereit für "${formData.title}"! Wir haben hart daran gearbeitet, ein Event auf die Beine zu stellen, das im Gedächtnis bleibt.\n\n` +
        `WAS DICH ERWARTET:\n` +
        `📍 Top Location ${formData.location ? `in ${formData.location}` : ''}\n` +
        `🔥 Exklusive Highlights\n` +
        `🤝 Community & Networking\n\n` +
        `Sichere dir jetzt einen der ${formData.maxParticipants} Plätze. Wir freuen uns auf dich!`;

      setFormData(prev => ({ ...prev, description: fullAiText }));
    } catch {
      setSubmitError("KI-Dienst momentan nicht erreichbar.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
          const data = await response.json();
          if (data && data[0]) {
            setMapCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        } catch (err) { console.error(err); }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.location]);

  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      const start = new Date(formData.startDate);
      start.setHours(start.getHours() + 4);
      setFormData(prev => ({ ...prev, endDate: start.toISOString().slice(0, 16) }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsWidgetUpload(false);
    }
  };

  const openWidget = () => {
    if (!window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dhqz1dl3p', 
        uploadPreset: 'ml_default',
        sources: ['url', 'camera', 'google_drive', 'facebook', 'instagram', 'unsplash'],
        multiple: false,
        theme: 'dark',
        styles: {
          palette: {
            window: "#09090b",
            windowBorder: "#27272a",
            tabIcon: "#8b5cf6",
            menuIcons: "#d4d4d8",
            textDark: "#000000",
            textLight: "#ffffff",
            link: "#a78bfa",
            action: "#7c3aed",
            activeTabIcon: "#ffffff",
            inactiveTabIcon: "#71717a",
            error: "#ef4444",
            inProgress: "#8b5cf6",
            complete: "#10b981",
            sourceBg: "#09090b"
          }
        }
      },
      (err, result) => {
        if (!err && result?.event === "success") { 
          setPreviewUrl(result.info.secure_url);
          setIsWidgetUpload(true);
          setImageFile(null);
        }
      }
    );
    widget.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, String(value)));
      if (isWidgetUpload && previewUrl) data.append('imageUrl', previewUrl);
      else if (imageFile) data.append('image', imageFile);
      await api.post('/events', data);
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof AxiosError ? err.response?.data?.message : "Fehler beim Speichern.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6 text-white font-sans selection:bg-violet-500/30">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-8 items-end">
          <div className="lg:col-span-2 flex items-center gap-4">
            <div className="p-3 bg-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
              <CalendarPlus size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Neues Event</h1>
          </div>
          <div className="hidden lg:block">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Live Vorschau</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-8 space-y-10 backdrop-blur-md shadow-2xl">
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Vibe wählen</label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all font-bold text-sm ${
                          formData.category === cat.id ? `${cat.bg} ${cat.border} ${cat.color} scale-105 shadow-lg` : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {cat.icon} {cat.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
                    <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-2xl pl-14 pr-6 py-5 outline-none transition-all text-lg text-white"
                      placeholder="Titel deines Events..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative group border-2 border-dashed border-zinc-800 rounded-3xl overflow-hidden bg-zinc-950/50 hover:border-violet-500/50 transition-all cursor-pointer flex items-center justify-center min-h-[180px]">
                    {previewUrl ? (
                      <div className="relative w-full h-full min-h-[250px]">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setImageFile(null); }} className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-all"><X size={20} /></button>
                      </div>
                    ) : (
                      <div className="text-center p-10 w-full" onClick={openWidget}>
                        <ImageIcon size={40} className="mx-auto text-zinc-700 group-hover:text-violet-400 mb-4 transition-colors" />
                        <p className="text-zinc-500 font-bold uppercase tracking-tighter mb-1">Bild droppen oder klicken</p>
                        <p className="text-zinc-700 text-[10px] font-black flex items-center justify-center gap-2 tracking-widest"><LinkIcon size={12} /> INSTAGRAM, FACEBOOK ODER URL MÖGLICH</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Zeitplan</label>
                     <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
                        <input type="datetime-local" required style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-violet-500 transition-all text-white"
                          value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                     </div>
                     <div className="relative group">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                        <input type="datetime-local" style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-violet-500 transition-all text-zinc-400"
                          value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                        <span className="absolute -bottom-5 left-1 text-[9px] text-zinc-600 italic uppercase">Enddatum ist optional</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Location & People</label>
                    <div className="relative group">
                      <MapPin className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${formData.location ? 'text-emerald-400 animate-pulse' : 'text-violet-400'}`} size={20} />
                      <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-16 py-4 outline-none focus:border-violet-500 transition-all text-white placeholder:text-zinc-700"
                        placeholder="Ort suchen..." value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                      {formData.location && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=...${encodeURIComponent(formData.location)}`} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-800"><Globe size={16} /></a>
                      )}
                    </div>
                    <div className="h-40 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
                      <MapContainer center={mapCoords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <Marker position={mapCoords} />
                        <RecenterMap coords={mapCoords} />
                      </MapContainer>
                    </div>
                    <div className="relative">
                      <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
                      <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-violet-500 transition-all text-white"
                        placeholder="Teilnehmerlimit" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="relative">
                      <Euro className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-400" size={20} />
                      <input type="number" disabled={formData.isFree} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-24 py-4 outline-none focus:border-violet-500 transition-all disabled:opacity-20 text-white"
                        placeholder="Preis" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                      <button type="button" onClick={() => setFormData({...formData, isFree: !formData.isFree, price: 0})} 
                        className={`absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${formData.isFree ? 'bg-emerald-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500'}`}>
                        {formData.isFree ? 'GRATIS' : 'TICKET'}
                      </button>
                  </div>

                  <div className="relative group">
                    <AlignLeft className="absolute left-5 top-6 text-violet-400" size={20} />
                    <button 
                      type="button" 
                      onClick={generateAIDescription}
                      disabled={aiLoading}
                      className="absolute right-4 top-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-violet-400 hover:text-white transition-all shadow-xl z-10 disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      {aiLoading ? 'GENERIEREN...' : 'KI-MAGIC'}
                    </button>
                    <textarea rows={5} className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl pl-14 pr-6 py-6 outline-none focus:border-violet-500 transition-all resize-none text-zinc-300 placeholder:text-zinc-700"
                      placeholder="Beschreibe dein Event..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} />
                  <p className="font-bold">{submitError}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full py-7 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto" size={32} /> : 'EVENT JETZT STARTEN'}
              </button>
            </form>
          </div>

          {/* VORSCHAU SPALTE */}
          <div className="hidden lg:block sticky top-8 h-full">
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
                <div className="h-64 bg-zinc-800 relative">
                  {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" /> : <div className="h-full w-full flex items-center justify-center text-zinc-700 bg-zinc-900"><ImageIcon size={64} className="opacity-20"/></div>}
                  <div className="absolute top-5 right-5 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-black text-violet-400 border border-violet-400/30 uppercase tracking-widest">{formData.category}</div>
                </div>
                <div className="p-10 flex flex-col justify-between flex-grow text-white">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black leading-tight uppercase italic break-words">{formData.title || "Titel..."}</h2>
                    <div className="space-y-4 text-zinc-400 text-base italic">
                      <div className="flex items-center gap-3"><Calendar size={18} className="text-violet-500" /><span>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('de-DE') : "Wann?"}</span></div>
                      <div className="flex items-center gap-3"><MapPin size={18} className="text-violet-500" />{formData.location || "Wo?"}</div>
                      <div className="flex items-center gap-3"><Users size={18} className="text-violet-500" />{formData.maxParticipants} Plätze</div>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-zinc-800 flex items-center justify-between">
                    <div className="text-3xl font-black tracking-tighter uppercase">{formData.isFree ? '0,00 €' : `${formData.price},00 €`}</div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}