import express from "express";
import cors from "cors";
import morgan from "morgan";
import { sequelize } from "./models/index";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from './routes/adminRoutes';
import bookingRoutes from './routes/bookingRoutes'; 
console.log("DB-URL vorhanden:", !!process.env.DATABASE_URL);
const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://deine-spätere-vercel-url.vercel.app"] // Hier kommt später deine Vercel-URL rein
    : "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes); 

app.get("/", (req, res) => {
  res.json({ 
    message: "Event Planner Backend läuft! 🚀",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login:    "POST /api/auth/login"
      },
      events: {
        all:      "GET /api/events",
        detail:   "GET /api/events/:id",
        create:   "POST /api/events"
      },
      bookings: {
        book:     "POST /api/bookings/:id/book" 
      }
    }
  });
});

app.use(errorHandler);
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Datenbankverbindung erfolgreich!");
    await sequelize.sync({ alter: true }); 
    console.log("✅ Datenbank-Tabellen synchronisiert (Updates übernommen).");

    app.listen(port, () => {
      console.log(`🚀 Server läuft auf http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Fehler beim Starten des Servers:", error);
  }
};

startServer();