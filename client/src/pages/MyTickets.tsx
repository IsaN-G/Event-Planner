import { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';

interface BookedEvent {
  id: number;
  title: string;
  startDate: string; 
  location: string;
  imageUrl?: string;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<BookedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/bookings/my-tickets');
        setTickets(res.data.bookings || res.data); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black mb-10 flex items-center gap-4">
        <Ticket size={36} className="text-blue-600" /> Meine Tickets
      </h1>
      
      {tickets.length === 0 ? (
        <p className="text-gray-500">Du hast noch keine Events gebucht.</p>
      ) : (
        <div className="grid gap-6">
          {tickets.map(event => (
            <div key={event.id} className="bg-white rounded-3xl p-4 flex gap-6 shadow-sm border">
              <img src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} className="w-32 h-32 rounded-2xl object-cover" />
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <div className="flex gap-4 text-gray-500 mt-2">
                   <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(event.startDate).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><MapPin size={16}/> {event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}