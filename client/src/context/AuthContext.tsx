// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AxiosError } from 'axios';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Beim App-Start versuchen, den User über Refresh Token wiederherzustellen
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await api.post('/auth/refresh', {}, { withCredentials: true });
        const accessToken = res.data.accessToken;

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        // User-Daten aus localStorage holen (vorübergehend)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch  {
        console.log("Kein gültiges Refresh Token gefunden.");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password }, { withCredentials: true });

      const { accessToken, user: loggedInUser } = res.data;

      // Token für zukünftige Requests setzen
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // User im State + localStorage speichern
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      throw new Error(error.response?.data?.message ?? 'Login fehlgeschlagen');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
    } catch  {
      console.log("Logout fehlgeschlagen, aber lokal bereinigen");
    }

    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  }
  return context;
};