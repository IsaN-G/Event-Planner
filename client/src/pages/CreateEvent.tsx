// CreateEvent.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, MapPin, AlignLeft, Type, Loader2, Users, Image as ImageIcon } from 'lucide-react';
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
    category: ''
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
        setError("Endzeit muss nach der Startzeit liegen!");
        return;
      }

      await api.post('/events', formData);
      
      alert("Event erfolgreich erstellt! 🎉");
      navigate('/');
    } catch (err) {
      let errorMessage = 'Fehler beim Erstellen des Events';

      if (err instanceof AxiosError) {
        errorMessage = 
          err.response?.data?.error || 
          err.response?.data?.message || 
          errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <CalendarPlus size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Event erstellen</h1>
              <p className="text-gray-400 font-medium">Plan dein nächstes großes Ding.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 flex items-center gap-2">
                <Type size={14} /> Titel des Events
              </label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold text-gray-800"
                placeholder="z.B. Sommernachtstraum Konzert"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 block">Start-Datum & Zeit *</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 block">End-Datum & Zeit *</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 flex items-center gap-2">
                  <MapPin size={14} /> Ort
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold"
                  placeholder="Berlin, Club XYZ..."
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 flex items-center gap-2">
                  <Users size={14} /> Max. Gäste
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 50})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 flex items-center gap-2">
                <ImageIcon size={14} /> Bild-URL (optional)
              </label>
              <input
                type="text"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> Beschreibung
              </label>
              <textarea
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold min-h-[120px]"
                placeholder="Erzähl uns mehr über das Event..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 ml-1">Kategorie</label>
              <select
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Firmenveranstaltungen">Firmenveranstaltungen</option>
                <option value="Gesellschaftliche Veranstaltungen">Gesellschaftliche Veranstaltungen</option>
                <option value="Kultur-/Unterhaltungsveranstaltungen">Kultur-/Unterhaltungsveranstaltungen</option>
                <option value="Wohltätigkeitsveranstaltungen (Charity)">Wohltätigkeitsveranstaltungen (Charity)</option>
                <option value="Virtuelle Veranstaltungen">Virtuelle Veranstaltungen</option>
                <option value="Hybridveranstaltungen">Hybridveranstaltungen</option>
                <option value="Pop-up-Events">Pop-up-Events</option>
                <option value="Kinder-Event">Kinder-Event</option>
                <option value="Reisen">Reisen</option>
                
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Event veröffentlichen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}