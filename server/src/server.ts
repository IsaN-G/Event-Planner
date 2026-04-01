import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import { sequelize } from "./models/index";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from './routes/adminRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatRoutes from "./routes/chatRoutes";

// WICHTIG: Message Modell importieren
import Message from "./models/Message";

console.log("DB-URL vorhanden:", !!process.env.DATABASE_URL);

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 4000;

// --- CORS ---
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

// --- MIDDLEWARE ---
app.use(express.json());
app.use(morgan("dev"));

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "Event Planner Backend läuft! 🚀",
    status: "online"
  });
});

// --- ERROR HANDLING ---
app.use(errorHandler);

// ====================== SOCKET.IO ======================
// ====================== SOCKET.IO ======================
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://event-planner-iota-five.vercel.app",  
    ],
    credentials: true,
    methods: ["GET", "POST"],
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on("joinEvent", (eventId: number) => {
    // WICHTIG: Wir nutzen den konsistenten Namen event_ID
    socket.join(`event_${eventId}`);
    console.log(`User joined event_${eventId}`);
  });

  // 1. NACHRICHT SENDEN (Mit Typ: Public oder Host)
  socket.on("sendMessage", async (data: { 
    eventId: number; 
    content: string; 
    userId: string | number; 
    username: string;
    type?: 'public' | 'host'; // NEU: Der Tab-Typ vom Frontend
  }) => {
    try {
      if (!data.content?.trim()) return;
  
      // Speichern in der DB
      const message = await Message.create({
        eventId: data.eventId,
        userId: Number(data.userId),
        content: data.content.trim(),
        type: data.type || 'public', // Falls nichts kommt, ist es 'public'
      });
  
      const fullMessage = {
        id: message.get('id'),
        content: data.content.trim(),
        createdAt: message.get('createdAt'),
        userId: Number(data.userId), // Flache ID für den Frontend-Vergleich
        type: data.type || 'public', // Mitschicken für die Tabs
        sender: { 
          id: Number(data.userId),
          username: data.username 
        }
      };
  
      // An alle im Raum senden
      io.to(`event_${data.eventId}`).emit("newMessage", fullMessage);
    } catch (err) {
      console.error("Socket sendMessage Error:", err);
    }
  });

  // 2. ECHTZEIT LÖSCHEN (Punkt 5 deiner Wunschliste)
  // Dieser Listener sorgt dafür, dass die Nachricht bei ALLEN verschwindet
  socket.on("deleteMessage", (data: { eventId: number; messageId: string | number }) => {
    console.log(`Nachricht ${data.messageId} wurde gelöscht, informiere Raum event_${data.eventId}`);
    io.to(`event_${data.eventId}`).emit("messageDeleted", data.messageId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ====================== SERVER START ======================
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Datenbankverbindung erfolgreich!");

   await sequelize.sync({ alter: true });
    console.log("✅ Datenbank-Tabellen synchronisiert.");

    httpServer.listen(port, () => {
      console.log(`🚀 Server + Socket.IO läuft auf Port: ${port}`);
    });

  } catch (error) {
    console.error("❌ Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

startServer();