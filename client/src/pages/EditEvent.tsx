import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, ArrowLeft, AlertCircle, ImageIcon } from 'lucide-react';
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

        const formattedDate = event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '';

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
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all"
      >
        <ArrowLeft size={20} /> Abbrechen
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
        <h1 className="text-3xl font-black mb-8 tracking-tighter text-gray-900">Event bearbeiten</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
        
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Event Bild URL
            </label>
            <div className="flex flex-col gap-4">
              {formData.imageUrl && (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                   <img 
                    src={formData.imageUrl} 
                    alt="Vorschau" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800')}
                   />
                </div>
              )}
              <div className="relative">
                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Event Titel</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Datum & Uhrzeit</label>
              <input
                type="datetime-local"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Max. Teilnehmer</label>
              <input
                type="number"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ort</label>
            <input
              type="text"
              required
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Kategorie</label>
            <input
              type="text"
              placeholder="z.B. Konzert, Sport, Workshop"
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Beschreibung</label>
            <textarea
              required
              rows={5}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {updating ? <Loader2 className="animate-spin" /> : <Save size={22} />}
            ÄNDERUNGEN SPEICHERN
          </button>
        </form>
      </div>
    </div>
  );
}