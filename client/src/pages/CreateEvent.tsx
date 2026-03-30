import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, 
  MapPin, 
  AlignLeft, 
  Users, 
  Image as ImageIcon, 
  Loader2 
} from 'lucide-react';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 50,
    imageUrl: '',
    category: 'Kultur-/Unterhaltungsveranstaltungen'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError("Das Enddatum muss nach dem Startdatum liegen!");
        setLoading(false);
        return;
      }

      await api.post('/events', formData);
      
      alert("Event erfolgreich erstellt! 🎉");
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = 'Fehler beim Erstellen des Events';
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            ← Zurück zum Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl">
              <CalendarPlus size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white">Neues Event erstellen</h1>
              <p className="text-gray-400 text-xl mt-2">Fülle die Details aus und veröffentliche dein Event.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-950 border border-red-800 rounded-2xl text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 space-y-10">

            {/* Titel */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">EVENT TITEL</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-xl font-semibold placeholder:text-gray-500 text-white"
                placeholder="z.B. Sommerkonzert an der Elbe"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Datum & Uhrzeit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-3">START DATUM & UHRZEIT</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-3">END DATUM & UHRZEIT</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Ort & Teilnehmer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-violet-400" /> ORT / LOCATION
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                  placeholder="Elbphilharmonie Hamburg"
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
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                />
              </div>
            </div>

            {/* Bild URL */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <ImageIcon size={20} className="text-violet-400" /> BILD URL (optional)
              </label>
              <input
                type="text"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-white"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            {/* Kategorie */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">KATEGORIE</label>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-5 text-lg text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Kultur-/Unterhaltungsveranstaltungen">Kultur-/Unterhaltungsveranstaltungen</option>
                <option value="Firmenveranstaltungen">Firmenveranstaltungen</option>
                <option value="Gesellschaftliche Veranstaltungen">Gesellschaftliche Veranstaltungen</option>
                <option value="Wohltätigkeitsveranstaltungen (Charity)">Wohltätigkeitsveranstaltungen (Charity)</option>
                <option value="Kinder-Event">Kinder-Event</option>
              </select>
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlignLeft size={20} className="text-violet-400" /> BESCHREIBUNG
              </label>
              <textarea
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-3xl px-6 py-5 resize-y min-h-[160px] text-white"
                placeholder="Beschreibe dein Event detailliert..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white font-black text-2xl rounded-3xl transition-all shadow-2xl shadow-violet-500/40 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={32} /> : 'EVENT VERÖFFENTLICHEN'}
          </button>
        </form>
      </div>
    </div>
  );
}