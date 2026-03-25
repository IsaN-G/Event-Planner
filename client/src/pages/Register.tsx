import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type AxiosError } from 'axios';
import api from '../services/api'; 

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
   
      await api.post('/auth/register', { username, email, password });
      
   
      alert("Registrierung erfolgreich! Wir haben dir zur Sicherheit eine Bestätigung per E-Mail gesendet. 📧");
      
    
      navigate('/login');
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      const errorMessage = axiosError.response?.data?.error || 
                           axiosError.response?.data?.message || 
                           'Registrierung fehlgeschlagen. Prüfe deine Daten.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Konto erstellen</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              placeholder="Dein Name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              placeholder="name@beispiel.de"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? 'Erstelle Konto...' : 'Registrieren'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Bereits ein Konto?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Hier einloggen
          </Link>
        </p>
      </div>
    </div>
  );
}