import { useState, useEffect } from 'react'; // useCallback entfernt, da nicht genutzt
import { useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, MapPin, AlignLeft, Users, 
  Image as ImageIcon, Loader2, 
  X, Tag, Calendar, Music, Trophy, Sparkles, Euro, Clock, AlertCircle, Link as Globe,
  Wand2, Gamepad2, Coffee, Utensils, Trees 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { AxiosError } from 'axios';

// --- 1. TYPES & GLOBAL DECLARATIONS (Müssen ganz oben stehen!) ---
interface CloudinaryResult {
  event: string;
  info: { 
    secure_url: string; 
  };
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: object, 
        callback: (error: Error | null, result: CloudinaryResult) => void
      ) => { open: () => void };
    };
  }
}

// --- 2. CONSTANTS & LEAFLET FIX ---
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

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(coords, 13); }, [coords, map]);
  return null;
}

// --- 3. MAIN COMPONENT ---
export default function CreateEvent() {
  const navigate = useNavigate();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateAIDescription = async () => {
    if (!formData.title.trim()) {
      setSubmitError("Bitte gib erst einen Titel ein!");
      return;
    }
    setAiLoading(true);
    setSubmitError(''); 
    try {
      await new Promise(r => setTimeout(r, 1200));
      const templates: Record<string, string> = {
        Party: "Die Nacht gehört uns! Fette Beats und kühle Drinks.",
        Sport: "Zeit an die Grenzen zu gehen!",
        Kultur: "Inspiration pur.",
        Workshop: "Upgrade your Skills!",
        Gaming: "Level Up!",
        Chill: "Deep Vibes Only.",
        Food: "Ein Fest für die Sinne.",
        Outdoor: "Ab nach draußen!"
      };
      const vibe = templates[formData.category] || "Sei dabei!";
      const text = `✨ ${vibe} ✨\n\nMach dich bereit für "${formData.title}"! 📍 Location: ${formData.location || 'TBA'}. Wir haben nur ${formData.maxParticipants} Plätze!`;
      setFormData(prev => ({ ...prev, description: text }));
    } catch {
      setSubmitError("KI-Fehler.");
    } finally { setAiLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
          const data = await res.json();
          if (data?.[0]) setMapCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } catch (err) { console.error(err); }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.location]);

  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      const end = new Date(new Date(formData.startDate).getTime() + 4 * 60 * 60 * 1000);
      setFormData(prev => ({ ...prev, endDate: end.toISOString().slice(0, 16) }));
    }
  }, [formData.startDate]);

  const openWidget = () => {
    if (!window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dhqz1dl3p', 
        uploadPreset: 'ml_default',
        theme: 'dark',
        styles: { palette: { window: "#09090b", sourceBg: "#09090b", windowBorder: "#27272a", tabIcon: "#8b5cf6", action: "#7c3aed", textLight: "#ffffff" } }
      },
      (err, result) => {
        if (!err && result && result.event === "success") { 
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
      const axiosErr = err as AxiosError<{ message?: string }>;
      setSubmitError(axiosErr.response?.data?.message || "Fehler beim Speichern.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6 text-white font-sans selection:bg-violet-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-8 items-end">
          <div className="lg:col-span-2 flex items-center gap-5">
            <div className="p-4 bg-violet-600 rounded-2xl shadow-2xl shadow-violet-500/20">
              <CalendarPlus size={32} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Neues Event</h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1">Organizer Studio</p>
            </div>
          </div>
          <div className="hidden lg:block border-l border-zinc-800 pl-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Real-Time Vorschau</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-[3rem] p-10 space-y-12 backdrop-blur-xl shadow-2xl">
                
                {/* Vibe Picker */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Event Vibe</label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-bold text-xs uppercase tracking-tight ${
                          formData.category === cat.id ? `${cat.bg} ${cat.border} ${cat.color} scale-105 shadow-xl border-violet-500/50` : 'border-zinc-800/50 text-zinc-600 hover:border-zinc-700'
                        }`}
                      >
                        {cat.icon} {cat.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title & Image */}
                <div className="space-y-6">
                  <div className="relative group">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-400 transition-colors" size={22} />
                    <input name="title" type="text" required className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/50 rounded-2xl pl-16 pr-6 py-6 outline-none transition-all text-xl font-bold placeholder:text-zinc-800"
                      placeholder="Wie heißt dein Spektakel?" value={formData.title} onChange={handleChange} />
                  </div>

                  <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file?.type.startsWith('image/')) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); setIsWidgetUpload(false); }
                    }} 
                    className="relative group border-2 border-dashed border-zinc-800 rounded-[2.5rem] overflow-hidden bg-zinc-950/30 hover:border-violet-500/30 transition-all cursor-pointer min-h-[220px] flex items-center justify-center">
                    {previewUrl ? (
                      <div className="relative w-full h-full min-h-[300px]">
                        <img src={previewUrl} className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all" alt="Preview" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); }} className="absolute top-6 right-6 p-3 bg-red-600/90 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"><X size={20} /></button>
                      </div>
                    ) : (
                      <div className="text-center p-12 w-full" onClick={openWidget}>
                        <ImageIcon size={48} className="mx-auto text-zinc-800 group-hover:text-violet-500/50 mb-4 transition-all group-hover:scale-110" />
                        <p className="text-zinc-500 font-black uppercase tracking-tighter text-sm">Media Upload</p>
                        <p className="text-zinc-700 text-[9px] font-black mt-2 tracking-[0.2em]">CLOUDINARY, INSTAGRAM ODER LOCAL FILE</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Timeline</label>
                     <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-500" size={20} />
                        <input name="startDate" type="datetime-local" required style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-violet-500 transition-all font-bold text-sm"
                          value={formData.startDate} onChange={handleChange} />
                     </div>
                     <div className="relative">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                        <input name="endDate" type="datetime-local" style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-violet-500 transition-all font-bold text-sm text-zinc-500"
                          value={formData.endDate} onChange={handleChange} />
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Location & Capacity</label>
                    <div className="relative group">
                      <MapPin className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${formData.location ? 'text-emerald-400' : 'text-violet-500'}`} size={20} />
                      <input name="location" type="text" required className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-16 py-5 outline-none focus:border-violet-500 transition-all font-bold text-sm"
                        placeholder="Wo findet es statt?" value={formData.location} onChange={handleChange} />
                      {formData.location && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`} target="_blank" rel="noreferrer" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-colors border border-zinc-800"><Globe size={16} /></a>
                      )}
                    </div>
                    <div className="h-44 w-full rounded-[2rem] overflow-hidden border border-zinc-800/50 bg-zinc-950 shadow-inner group transition-all hover:border-violet-500/30">
                      <MapContainer center={mapCoords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <Marker position={mapCoords} />
                        <RecenterMap coords={mapCoords} />
                      </MapContainer>
                    </div>
                  </div>
                </div>

                {/* Price & Description */}
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-500" size={20} />
                        <input name="maxParticipants" type="number" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-violet-500 transition-all font-bold text-sm"
                          value={formData.maxParticipants} onChange={handleChange} />
                    </div>
                    <div className="relative flex gap-3">
                        <div className="relative flex-grow">
                          <Euro className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-500" size={20} />
                          <input name="price" type="number" disabled={formData.isFree} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-violet-500 transition-all disabled:opacity-20 font-black text-lg"
                            value={formData.price} onChange={handleChange} />
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, isFree: !formData.isFree, price: 0})} 
                          className={`px-6 rounded-2xl text-[10px] font-black transition-all border ${formData.isFree ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
                          {formData.isFree ? 'FREE' : 'PAID'}
                        </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <AlignLeft className="absolute left-6 top-8 text-violet-500" size={22} />
                    <button type="button" onClick={generateAIDescription} disabled={aiLoading} className="absolute right-6 top-6 flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-violet-400 hover:text-white hover:bg-violet-600 transition-all z-10 disabled:opacity-50 shadow-xl">
                      {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} KI-BOOST
                    </button>
                    <textarea name="description" rows={6} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[2.5rem] pl-16 pr-8 py-8 outline-none focus:border-violet-500 transition-all resize-none text-zinc-400 leading-relaxed italic placeholder:text-zinc-800"
                      placeholder="Erzähl uns die Story hinter dem Event..." value={formData.description} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-4 p-6 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-red-500 text-xs font-bold animate-in slide-in-from-top-4 duration-500">
                  <div className="p-2 bg-red-500/20 rounded-lg"><AlertCircle size={20} /></div>
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={loading} className="group relative w-full py-8 bg-white hover:bg-violet-600 text-black hover:text-white font-black text-2xl rounded-[3rem] shadow-2xl transition-all duration-500 active:scale-95 disabled:opacity-50 overflow-hidden uppercase italic tracking-tighter">
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="animate-spin" size={32} /> : <>Event publizieren <Sparkles size={24}/></>}
                </span>
              </button>
            </form>
          </div>

          {/* Sticky Preview */}
          <div className="hidden lg:block sticky top-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-[4rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col min-h-[680px] group/card hover:scale-[1.02] transition-all duration-700">
                <div className="h-80 bg-zinc-950 relative overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-cover transition-transform duration-1000 group-hover/card:scale-110" alt="Preview" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-900"><ImageIcon size={100} className="opacity-10"/></div>
                  )}
                  <div className="absolute top-8 right-8 px-6 py-2 bg-black/60 backdrop-blur-xl rounded-full text-[10px] font-black text-violet-400 border border-violet-400/30 uppercase tracking-widest italic">{formData.category}</div>
                </div>
                <div className="p-12 flex flex-col justify-between flex-grow bg-gradient-to-b from-transparent to-black/20">
                  <div className="space-y-8">
                    <h2 className="text-5xl font-black leading-[0.85] uppercase italic tracking-tighter break-words text-white">{formData.title || "Titel..."}</h2>
                    <div className="space-y-5 text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-4 text-violet-500/80"><Calendar size={20} /><span>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' }) : "Datum wählen"}</span></div>
                      <div className="flex items-center gap-4"><MapPin size={20} />{formData.location || "Location?"}</div>
                      <div className="flex items-center gap-4"><Users size={20} />{formData.maxParticipants} Plätze frei</div>
                    </div>
                  </div>
                  <div className="pt-10 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
                    <div className="text-4xl font-black italic tracking-tighter text-white">{formData.isFree ? '0.00 €' : `${formData.price}.00 €`}</div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Vorschau</span>
                       <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
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