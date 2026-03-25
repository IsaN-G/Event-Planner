# 📅 EventPlanner - Fullstack Event Management System

Ein modernes, rollenbasiertes System zur Planung und Buchung von Events. Gebaut mit React, Node.js und PostgreSQL.

## 🚀 Features

- **Rollenbasiertes System:** Unterscheidung zwischen `User`, `Organizer` und `Admin`.
- **Event-Management:** Organizer können Events erstellen, bearbeiten und löschen.
- **Buchungssystem:** User können Tickets für Events reservieren (inklusive Kapazitätsprüfung).
- **Admin-Dashboard:** Zentrale Verwaltung von Benutzerrollen und Systemübersicht.
- **Sicherheit:** - Passwort-Hashing mit `bcrypt` direkt über Sequelize-Hooks.
  - Gesicherte API-Routen via `JSON Web Tokens (JWT)`.
  - Zentrale Konfiguration der Umgebungsvariablen.
- **Responsive Design:** Modernes UI, optimiert für alle Endgeräte mit Tailwind CSS.

## 🛠 Tech Stack

**Frontend:**
- React (Vite) mit TypeScript
- Tailwind CSS für das Styling
- Lucide-React für Icons
- Axios für API-Anfragen

**Backend:**
- Node.js & Express
- Sequelize ORM
- PostgreSQL Datenbank
- JWT für die Authentifizierung

## 📦 Installation & Setup

### 1. Repository klonen
```bash
git clone 
cd event-planner

```
### 2. Backend einrichten
```bash
cd server
bun install

```
 
Erstelle eine .env Datei im server-Ordner:

PORT=4000
DB_NAME=event_planner
DB_USER=postgres
DB_PASSWORD=dein_passwort
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=supersecret_jwt_key_2026
NODE_ENV=development

Starte den Server

```bash
bun run dev

```
### 3. Frontend einrichten
Öffne ein zweites Terminal
```bash
cd client
bun install
bun run dev

```
#### API Endpunkte (Auszug)

Methode	 Endpunkt	        Beschreibung	   Zugriff
POST	/api/auth/register	Registrierung	   Öffentlich
POST	/api/auth/login	    Login & JWT	       Öffentlich
GET	    /api/events	Alle    Events	           Öffentlich
POST	/api/events	        Event erstellen	   Organizer/Admin
POST	/api/bookings/:id	Ticket buchen	   Authentifiziert
GET	    /api/admin/users	User verwalten	   Admin