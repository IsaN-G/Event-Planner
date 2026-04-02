# 📅 EventPlanner - Pro Fullstack Management System

Ein hochmodernes, interaktives System zur Planung, Buchung und Live-Begleitung von Events. Gebaut für Performance und Skalierbarkeit mit einem modernen Tech-Stack.

## 🚀 Neue & Kern-Features

* **Rollenbasiertes System:** Differenzierte Berechtigungen für `User`, `Organizer` und `Admin`.
* **Live-Event-Steuerung:** Organizer können Events per Knopfdruck "Live" schalten oder den Status jederzeit zurücksetzen.
* **Interaktiver Live-Chat:** Echtzeit-Kommunikation zwischen Teilnehmern und Hosts während des Events via **Socket.io**.
* **Dynamisches Preis-System:** Unterstützung für kostenlose und kostenpflichtige Events (inkl. automatischer Typ-Konvertierung von Strings zu Numbers).
* **Smart Agenda:** Flexibler Zeitplan-Editor für Events mit automatischer Validierung und Array-Mapping.
* **Geodaten-Integration:** Standort-Visualisierung durch interaktive **Leaflet-Karten** (OpenStreetMap).
* **Sicherheit:** * Automatisches Passwort-Hashing via `bcrypt` Hooks direkt im Sequelize-Model.
    * Sichere API-Kommunikation durch `JWT (JSON Web Tokens)`.
    * Zentrale Konfiguration der Umgebungsvariablen.

## 🛠 Tech Stack

**Frontend:**
* React (Vite) mit **TypeScript**
* Tailwind CSS (Modernes Dark-UI Design)
* Lucide-React für Icons
* Socket.io-client für Echtzeit-Features
* Axios für API-Anfragen
* React-Leaflet für Maps

**Backend:**
* Node.js & Express
* Sequelize ORM (PostgreSQL / Supabase)
* Socket.io (WebSockets)
* Multer für Bild-Uploads
* JWT für Authentifizierung

## 📦 Installation & Setup

### 1. Repository klonen
```bash
git clone [https://github.com/dein-username/event-planner.git](https://github.com/dein-username/event-planner.git)
cd event-planner

