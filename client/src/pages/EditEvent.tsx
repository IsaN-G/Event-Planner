import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  Image as ImageIcon,
  MapPin,
  Users,
  AlignLeft 
} from 'lucide-react';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    maxParticipants: '',
    imageUrl: '',
    category: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const event = res.data.event || res.data;

        const formattedDate = event.startDate 
          ? new Date(event.startDate).toISOString().slice(0, 16) 
          : '';

        setFormData({
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          startDate: formattedDate,
          maxParticipants: event.maxParticipants?.toString() || '',
          imageUrl: event.imageUrl || '',
          category: event.category || ''
        });
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        setError("Event konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants)
      };

      await api.put(`/events/${id}`, dataToSend);
      alert("Event erfolgreich aktualisiert! ✨");
      navigate(`/events/${id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Update fehlgeschlagen.");
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 font-medium"
        >
          <ArrowLeft size={20} /> Zurück
        </button>

        {/* Haupt Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
          
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl">
              <Save size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white">Event bearbeiten</h1>
              <p className="text-gray-400 text-xl mt-1">Ändere die Details deines Events</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-950 border border-red-800 rounded-2xl text-red-400 font-medium flex items-center gap-3">
              <AlertCircle size={24} />
              {error}
            </div>
          )}

          {/* Formular */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Bild URL */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <ImageIcon size={20} className="text-violet-400" /> BILD URL
              </label>
              {formData.imageUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-zinc-700">
                  <img 
                    src={formData.imageUrl} 
                    alt="Vorschau" 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800';
                    }}
                  />
                </div>
              )}
              <input
                type="text"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            {/* Titel */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">EVENT TITEL</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-xl font-semibold text-white"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Datum */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">DATUM & UHRZEIT</label>
              <input
                type="datetime-local"
                required
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            {/* Ort & Max Teilnehmer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-violet-400" /> ORT
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users size={20} className="text-violet-400" /> MAX. TEILNEHMER
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </div>
            </div>

            {/* Kategorie */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">KATEGORIE</label>
              <input
                type="text"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                placeholder="z.B. Konzert, Workshop, Festival"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlignLeft size={20} className="text-violet-400" /> BESCHREIBUNG
              </label>
              <textarea
                rows={6}
                required
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-3xl px-6 py-5 resize-y min-h-[160px] text-white"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updating}
              className="w-full py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white font-black text-2xl rounded-3xl transition-all shadow-2xl shadow-violet-500/40 disabled:opacity-70 mt-6"
            >
              {updating ? (
                <Loader2 className="animate-spin mx-auto" size={32} />
              ) : (
                'ÄNDERUNGEN SPEICHERN'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}