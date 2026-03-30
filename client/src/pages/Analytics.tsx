import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import api from '../services/api';

interface AnalyticsData {
  totalEvents: number;
  totalBookings: number;
  averageOccupancy: number;
  topEvents: Array<{
    id: number;
    title: string;
    bookingsCount: number;
    maxParticipants: number;
    occupancy: number;
    category: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    bookings: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/events/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Analytics Fehler:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={60} />
      </div>
    );
  }

  if (!data) {
    return <div className="text-white p-10">Fehler beim Laden der Analytics.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl">
              <BarChart3 size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">Event Analytics</h1>
              <p className="text-gray-400 text-xl mt-1">Performance deiner Veranstaltungen</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} /> Zurück zum Dashboard
          </button>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="text-violet-400" size={32} />
              <div>
                <p className="text-gray-400">Gesamt Events</p>
                <p className="text-5xl font-black">{data.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <Users className="text-fuchsia-400" size={32} />
              <div>
                <p className="text-gray-400">Gesamtbuchungen</p>
                <p className="text-5xl font-black">{data.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <TrendingUp className="text-emerald-400" size={32} />
              <div>
                <p className="text-gray-400">Durchschnittliche Auslastung</p>
                <p className="text-5xl font-black">{data.averageOccupancy}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Events */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp size={28} className="text-violet-400" />
            Top Events
          </h2>
          
          <div className="space-y-4">
            {data.topEvents.map((event, index) => (
              <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-violet-500">#{index + 1}</div>
                    <div>
                      <h3 className="text-2xl font-semibold">{event.title}</h3>
                      <p className="text-gray-400">{event.category}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Buchungen</span>
                    <span className="font-semibold">{event.bookingsCount} / {event.maxParticipants}</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                      style={{ width: `${event.occupancy}%` }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-400">{event.occupancy}%</div>
                  <p className="text-xs text-gray-500">Auslastung</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kategorie-Übersicht */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Events nach Kategorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.categoryStats.map((cat) => (
              <div key={cat.category} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-semibold">{cat.category}</p>
                    <p className="text-4xl font-black mt-2">{cat.count}</p>
                    <p className="text-gray-400">Events</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-fuchsia-400">{cat.bookings}</p>
                    <p className="text-gray-400">Buchungen</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}