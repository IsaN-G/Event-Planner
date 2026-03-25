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

function App() {
  const { user } = useAuth();

  const isAuthenticated = !!user;
  const canCreateEvents = user?.role === 'admin' || user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          
          <Route path="/" element={<Events />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route 
            path="/my-tickets" 
            element={
              isAuthenticated ? (
                <MyTickets />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/create-event" 
            element={
              canCreateEvents ? (
                <CreateEvent />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/events/edit/:id" 
            element={
              canCreateEvents ? (
                <EditEvent />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;