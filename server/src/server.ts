import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./models/index";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from './routes/adminRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatRoutes from "./routes/chatRoutes";
import Message from "./models/Message";

console.log("DB-URL vorhanden:", !!process.env.DATABASE_URL);

const app = express();

app.get('/ping', (req, res) => {
  res.status(200).send('pong ✅');
});

const httpServer = createServer(app);

const port = process.env.PORT || 4000;


app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://event-planner-iota-five.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);


app.get("/", (req, res) => {
  res.json({ 
    message: "Event Planner Backend läuft! 🚀",
    status: "online" 
  });
});


app.use(errorHandler);

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
    socket.join(`event_${eventId}`);
    console.log(`User joined event_${eventId}`);
  });

  socket.on("sendMessage", async (data: { 
    eventId: number; 
    content: string; 
    userId: string | number; 
    username: string;
    type?: 'public' | 'host';
  }) => {
    try {
      if (!data.content?.trim()) return;

      const message = await Message.create({
        eventId: data.eventId,
        userId: Number(data.userId),
        content: data.content.trim(),
        type: data.type || 'public',
      });

      const fullMessage = {
        id: message.get('id') as string,
        content: data.content.trim(),
        createdAt: message.get('createdAt'),
        userId: Number(data.userId),
        type: data.type || 'public',
        sender: { 
          id: Number(data.userId),
          username: data.username 
        }
      };

      io.to(`event_${data.eventId}`).emit("newMessage", fullMessage);
    } catch (err) {
      console.error("Socket sendMessage Error:", err);
    }
  });

  socket.on("deleteMessage", (data: { eventId: number; messageId: string }) => {
    console.log(`Nachricht ${data.messageId} wurde gelöscht → broadcast an event_${data.eventId}`);
    io.to(`event_${data.eventId}`).emit("messageDeleted", data.messageId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Datenbankverbindung erfolgreich!");


    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log("✅ Datenbank-Tabellen synchronisiert (Development).");
    } else {
      console.log("🚀 Production Mode: Verwende Migrations (nicht alter)!");
    }

    httpServer.listen(port, () => {
      console.log(`🚀 Server + Socket.IO läuft auf Port: ${port}`);
    });

  } catch (error) {
    console.error("❌ Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

startServer();