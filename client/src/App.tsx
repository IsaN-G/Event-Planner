import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetail from './pages/EventDetail';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent'; 
import EditEvent from './pages/EditEvent'; 
import MyTickets from './pages/MyTickets'; 
import Dashboard from './pages/Dashboard';

function App() {
  const { user } = useAuth();

  const isAuthenticated = !!user;
  const isOrganizerOrAdmin = user?.role === 'admin' || user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Öffentliche Routen */}
          <Route path="/" element={<Events />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* User Routen (Tickets) */}
          <Route 
            path="/my-tickets" 
            element={isAuthenticated ? <MyTickets /> : <Navigate to="/login" replace />} 
          />

          {/* Organizer & Admin Routen */}
          <Route 
            path="/dashboard" 
            element={isOrganizerOrAdmin ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/create-event" 
            element={isOrganizerOrAdmin ? <CreateEvent /> : <Navigate to="/login" replace />} 
          />

          {/* WICHTIG: Route an Dashboard-Link angepasst (/edit-event/:id) */}
          <Route 
            path="/edit-event/:id" 
            element={isOrganizerOrAdmin ? <EditEvent /> : <Navigate to="/login" replace />} 
          />

          {/* Admin exklusive Route */}
          <Route 
            path="/admin" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />

          {/* Catch-all: Unbekannte Seiten leiten zur Startseite */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;