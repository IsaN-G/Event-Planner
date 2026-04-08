/* eslint-disable react-refresh/only-export-components */
// src/context/SocketContext.tsx
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext<typeof socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socket.connect();

      socket.on('connect', () => console.log('✅ Socket connected'));
      socket.on('disconnect', () => console.log('❌ Socket disconnected'));
    } else {
      socket.disconnect();
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket muss innerhalb von SocketProvider verwendet werden');
  }
  return context;
};