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
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}


const getInitialToken = () => localStorage.getItem('token');
const getInitialUser = (): User | null => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken());
  const [user, setUser] = useState<User | null>(getInitialUser());
  
  
  const [isLoading] = useState(false); 

 
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
   
      const res = await api.post<{ token: string; user: User }>(
        '/auth/login',
        { email, password }
      );

      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
    } catch (err) {
    
      const error = err as AxiosError<{ message?: string }>;
      throw new Error(error.response?.data?.message ?? 'Login fehlgeschlagen');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  }
  return context;
};