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

  useEffect(() => {
    const restoreUser = async () => {
      // 1. Sofort gespeicherten User laden (verhindert Flackern)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch  {
          console.warn("Ungültiger User im localStorage");
          localStorage.removeItem('user');
        }
      }

      // 2. Refresh Token versuchen
      try {
        const res = await api.post('/auth/refresh');
        const { accessToken, user: refreshedUser } = res.data;

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
      } catch  {
        console.log("Kein gültiger Refresh-Token (normal nach Cookie-Löschen)");
        localStorage.removeItem('user');
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

      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
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
    } catch {
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