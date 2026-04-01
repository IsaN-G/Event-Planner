import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertCircle,
  ArrowLeft,
  Trophy,
  Activity,
  Layers
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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-10">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-white font-black uppercase tracking-widest">Daten-Sync fehlgeschlagen</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-4 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Console
            </button>
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
              Data <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Insights</span>
            </h1>
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-md">
            <Activity className="text-violet-500" size={32} />
          </div>
        </div>

        {/* TOP LEVEL STATS - BOLD & MINIMAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-violet-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <div className="relative bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-10 backdrop-blur-xl">
                <Calendar className="text-zinc-600 mb-6" size={24} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Total Events</p>
                <p className="text-6xl font-black italic tracking-tighter">{data.totalEvents}</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-fuchsia-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <div className="relative bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-10 backdrop-blur-xl">
                <Users className="text-zinc-600 mb-6" size={24} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Bookings</p>
                <p className="text-6xl font-black italic tracking-tighter text-fuchsia-500">{data.totalBookings.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <div className="relative bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-10 backdrop-blur-xl">
                <TrendingUp className="text-zinc-600 mb-6" size={24} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Occupancy</p>
                <p className="text-6xl font-black italic tracking-tighter text-emerald-400">{data.averageOccupancy}%</p>
            </div>
          </div>
        </div>

        {/* TOP EVENTS - REIMAGINED AS A RANKING */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <Trophy size={20} className="text-violet-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">High Performance Ranking</h2>
          </div>
          
          <div className="grid gap-4">
            {data.topEvents.map((event, index) => (
              <div key={event.id} className="group bg-zinc-900/20 border border-zinc-800/50 hover:border-violet-500/50 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center gap-10 transition-all duration-500">
                <div className="flex items-center gap-8 md:w-1/3">
                  <div className="text-5xl font-black italic text-zinc-800 group-hover:text-violet-500 transition-colors duration-500">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-white transition-colors">{event.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{event.category}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Tickets Sold</span>
                    <span className="font-bold text-sm tracking-tighter">{event.bookingsCount} / {event.maxParticipants}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                      style={{ width: `${event.occupancy}%` }}
                    />
                  </div>
                </div>

                <div className="md:w-32 text-right">
                  <div className="text-4xl font-black italic tracking-tighter text-emerald-400 group-hover:scale-110 transition-transform">{event.occupancy}%</div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-1">Success Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY STATS - GRID CARDS */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <Layers size={20} className="text-fuchsia-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.categoryStats.map((cat) => (
              <div key={cat.category} className="bg-zinc-950/50 border border-zinc-800/80 rounded-[32px] p-8 hover:bg-zinc-900/50 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6 group-hover:text-fuchsia-500 transition-colors">
                  {cat.category}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-4xl font-black italic tracking-tighter mb-1">{cat.count}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Events</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black italic tracking-tighter text-zinc-300 mb-1">{cat.bookings}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Sales</p>
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