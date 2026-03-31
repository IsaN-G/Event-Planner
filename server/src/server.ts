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

// --- CORS KONFIGURATION ---
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Falls Preflight-Fehler bleiben, nutze diese Syntax (ohne Sternchen-Fehler):
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
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

app.get("/", (req, res) => {
  res.json({ 
    message: "Event Planner Backend läuft! 🚀",
    status: "online"
  });
});

// --- ERROR HANDLING ---
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Datenbankverbindung erfolgreich!");
    
    // Sync nur in der Entwicklung oder vorsichtig in Production
    await sequelize.sync({ alter: true }); 
    console.log("✅ Datenbank-Tabellen synchronisiert.");

    app.listen(port, () => {
      console.log(`🚀 Server läuft auf Port: ${port}`);
    });
  } catch (error) {
    console.error("❌ Fehler beim Starten des Servers:", error);
    process.exit(1); // Beendet den Prozess bei fatalem Fehler
  }
};

startServer();