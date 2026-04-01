import { io } from 'socket.io-client';

const socketUrl = import.meta.env.PROD 
  ? "https://event-planner-backend-m16o.onrender.com"   
  : "http://localhost:4000";

const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;