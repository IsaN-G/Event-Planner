# 🎟️ **EventPlanner** – Das moderne Event-Management System

**Eine vollwertige Fullstack-Plattform zum Erstellen, Buchen und Live-Begleiten von Events**  
Mit Echtzeit-Chat, interaktiven Karten, Ticket-System, Admin-Panel und Organizer-Dashboard.

---

## ✨ Highlights

- ✅ **Rollenbasiertes System** (`User` • `Organizer` • `Admin`)
- ✅ **Live-Chat** während des Events (Socket.io)
- ✅ **Echtzeit-Status** – Organizer kann Events per Knopfdruck „Live“ schalten
- ✅ **Interaktive Leaflet-Karte** mit Standort-Suche
- ✅ **Cloudinary-Upload** für Event-Bilder
- ✅ **Ticket-Buchung** mit Teilnehmer-Limit
- ✅ **Organizer Dashboard** mit Analytics & eigenen Events
- ✅ **Admin Panel** zur User-Verwaltung
- ✅ **KI-Boost** – Automatische Event-Beschreibung generieren
- ✅ **Responsives Dark-Design** mit Glassmorphism
- ✅ **JWT + Refresh-Token** Authentifizierung

---

## 🛠 Tech Stack

**Frontend (Vite + React 19)**
- React + TypeScript
- Tailwind CSS v4 + Glassmorphism
- React Router v7
- Socket.io-client
- React-Leaflet (Karten)
- Lucide Icons
- Cloudinary Widget

**Backend (Node.js + Express)**
- Express + Sequelize (PostgreSQL)
- Socket.io (Echtzeit-Chat)
- JWT + HTTP-Only Cookies
- Multer + Cloudinary
- Bcrypt (Passwort-Hashing)

**Datenbank**
- PostgreSQL (Supabase / Neon / Railway)

---

## 🚀 Lokales Setup

### 1. Repository klonen
   ```bash
   git clone <dein-repo-url>
   cd event-planner


2. Abhängigkeiten installieren
   ```bash
   bun install

3. Frontend & Backend gleichzeitig starten
   ```bash
   run dev
→ Frontend läuft auf http://localhost:5173
→ Backend läuft auf http://localhost:4000


🔑 Wichtige Umgebungsvariablen
Erstelle im Root eine .env Datei:

# Backend
DATABASE_URL=postgres://...
JWT_SECRET=dein_super_geheimes_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Optional (falls du den Render-Backend-Link nutzt)
VITE_API_URL=https://dein-backend.onrender.com


📁 Projektstruktur
textevent-planner/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
│   └── index.html
├── server/                  # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── config/
├── package.json             # Root (concurrently + bun)
└── README.md



👤 Test-Account (bereits angelegt)
E-Mail: testusr@gmail.com
Passwort: testuser
Rolle: user


📸 Wichtige Features im Überblick

- Events entdecken mit Kategorien & Suche
- Event erstellen mit Bild-Upload, Karte und Agenda
- Live-Chat (öffentlich + Host-Chat)
- Ticket buchen mit Auslastungsanzeige
- Meine Tickets mit QR-Code-Vorschau
- Organizer Dashboard mit Statistik
- Admin Panel zur User-Verwaltung


🚀 Deployment

Frontend: Vercel (automatisch über vercel.json)
Backend: Render / Railway / Fly.io (Port 4000)
Datenbank: Supabase, Neon oder Railway Postgres