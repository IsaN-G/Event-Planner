import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, AlignLeft, Users, 
  Image as ImageIcon, Loader2, 
  Tag, Calendar, Music, Trophy, Sparkles, Euro, AlertCircle, 
  Wand2, Gamepad2, Coffee, Utensils, Trees, Save, ArrowLeft, Clock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { AxiosError } from 'axios';

// --- TYPES & LEAFLET FIX ---
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

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
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

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agenda: '', // NEU: Agenda im State
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 50,
    category: 'Party',
    price: 0,
    isFree: true
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); 
  const [submitError, setSubmitError] = useState('');
  const [mapCoords, setMapCoords] = useState<[number, number]>([52.52, 13.405]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const event = res.data.event || res.data; 
        
        setFormData({
          title: event.title || '',
          description: event.description || '',
          agenda: event.agenda || '', // NEU: Agenda aus DB laden
          startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
          location: event.location || '',
          maxParticipants: event.maxParticipants || 50,
          category: event.category || 'Party',
          price: event.price || 0,
          isFree: (Number(event.price) === 0 || !event.price)
        });

        if (event.imageUrl) setPreviewUrl(event.imageUrl);
        
        if (event.lat && event.lng) {
          setMapCoords([parseFloat(event.lat), parseFloat(event.lng)]);
        }
      } catch {
        setSubmitError("Event konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 3) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
          const data = await response.json();
          if (data?.[0]) setMapCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } catch (err) { console.error(err); }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.location]);

  const openWidget = () => {
    if (!window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dhqz1dl3p', 
        uploadPreset: 'ml_default',
        theme: 'dark'
      },
      (err, result) => {
        if (!err && result?.event === "success") { 
          setPreviewUrl(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSubmitError('');
    try {
      await api.put(`/events/${id}`, { 
        ...formData, 
        imageUrl: previewUrl,
        lat: mapCoords[0],
        lng: mapCoords[1]
      });
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setSubmitError(
        axiosError.response?.data?.message || "Fehler beim Aktualisieren des Events."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const generateAIDescription = async () => {
    if (!formData.title) return setSubmitError("Titel fehlt!");
    setAiLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const aiText = `✨ Update: ${formData.title} ✨\n\nWir haben das Event optimiert! Sei dabei in ${formData.location || 'unserer Location'} für ein unvergessliches Erlebnis.`;
      setFormData(prev => ({ ...prev, description: aiText }));
    } finally { setAiLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={60} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6 text-white selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-600 rounded-2xl shadow-xl shadow-orange-500/20">
              <Save size={32} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-white">
                Event <span className="text-orange-500">Edit</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1">Configuration Mode</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl space-y-12">
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Change Vibe</label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-bold text-xs uppercase tracking-tighter ${
                          formData.category === cat.id ? `${cat.bg} ${cat.border} ${cat.color} scale-105 border-orange-500/40 shadow-lg shadow-orange-500/5` : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                        }`}
                      >
                        {cat.icon} {cat.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                    <input type="text" required className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-orange-500/50 rounded-[24px] pl-16 pr-6 py-6 outline-none transition-all text-xl font-bold"
                      placeholder="Title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div onClick={openWidget} className="relative group rounded-[32px] overflow-hidden border-2 border-dashed border-zinc-800 bg-zinc-950/30 hover:border-orange-500/30 transition-all cursor-pointer min-h-[300px] flex items-center justify-center">
                    {previewUrl ? (
                      <div className="relative w-full h-[350px]">
                        <img src={previewUrl} className="w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all" alt="Preview" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <ImageIcon size={48} className="text-white/20 mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Replace Visual</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={40} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No image set</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Schedule</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                      <input type="datetime-local" required style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-orange-500 transition-all font-bold text-sm"
                        value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                      <input type="datetime-local" style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950/30 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-orange-500 transition-all font-bold text-sm text-zinc-500"
                        value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Location & Capacity</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                      <input type="text" required className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-orange-500 transition-all font-bold text-sm"
                        placeholder="Search location..." value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    
                    <div className="h-40 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                      <MapContainer center={mapCoords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <Marker position={mapCoords} />
                        <RecenterMap coords={mapCoords} />
                      </MapContainer>
                    </div>

                    <div className="relative">
                      <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                      <input type="number" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-orange-500 transition-all font-bold text-sm"
                        value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Euro className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                      <input type="number" disabled={formData.isFree} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-orange-500 transition-all disabled:opacity-20 font-black text-xl"
                        value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, isFree: !formData.isFree, price: 0})} 
                      className={`px-8 rounded-2xl text-[10px] font-black transition-all border ${formData.isFree ? 'bg-orange-600 border-orange-500 text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
                      {formData.isFree ? 'FREE' : 'PAID'}
                    </button>
                  </div>

                  {/* Beschreibung */}
                  <div className="relative group">
                    <AlignLeft className="absolute left-6 top-8 text-orange-500" size={20} />
                    <button type="button" onClick={generateAIDescription} disabled={aiLoading} className="absolute right-6 top-6 flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-orange-500 hover:bg-orange-500 hover:text-black transition-all z-10">
                      {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} RE-WRITE AI
                    </button>
                    <textarea rows={6} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[32px] pl-16 pr-8 py-8 outline-none focus:border-orange-500 transition-all resize-none text-zinc-400 italic"
                      value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>

                  {/* NEU: AGENDA / TIMELINE SECTION */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Event Agenda / Line-Up</label>
                    <div className="relative group">
                      <Clock className="absolute left-6 top-8 text-orange-500" size={20} />
                      <textarea rows={6} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[32px] pl-16 pr-8 py-8 outline-none focus:border-orange-500 transition-all resize-none text-zinc-400 font-mono text-sm"
                        placeholder="14:00 - Einlass&#10;15:00 - Start&#10;..." 
                        value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                  <AlertCircle size={20} /> {submitError}
                </div>
              )}

              <button type="submit" disabled={saveLoading} className="w-full py-8 bg-white hover:bg-orange-500 text-black font-black text-2xl rounded-[3rem] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 uppercase italic tracking-tighter">
                {saveLoading ? <Loader2 className="animate-spin" size={32} /> : <>Save Changes <Save size={24}/></>}
              </button>
            </form>
          </div>

          <div className="hidden lg:block sticky top-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[4rem] overflow-hidden shadow-3xl flex flex-col min-h-[650px]">
              <div className="h-72 bg-zinc-800 relative">
                {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" /> : <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-zinc-900"><ImageIcon size={80}/></div>}
                <div className="absolute top-8 right-8 px-5 py-2 bg-black/60 backdrop-blur-xl rounded-full text-[10px] font-black text-orange-500 border border-orange-500/30 uppercase tracking-[0.2em] italic">{formData.category}</div>
              </div>
              <div className="p-12 flex flex-col justify-between flex-grow">
                <div className="space-y-8">
                  <h2 className="text-5xl font-black leading-[0.9] uppercase italic tracking-tighter break-words">{formData.title || "Untitled"}</h2>
                  <div className="space-y-5 text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4 text-orange-500/70"><Calendar size={20} /><span>{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Date TBD'}</span></div>
                    <div className="flex items-center gap-4"><MapPin size={20} />{formData.location || 'Location TBD'}</div>
                  </div>
                </div>
                <div className="pt-10 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
                  <div className="text-4xl font-black italic tracking-tighter">{formData.isFree ? 'FREE' : `${formData.price}€`}</div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Live Preview</span>
                     <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
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