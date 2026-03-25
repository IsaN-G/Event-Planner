import * as dotenv from 'dotenv';
import path from 'path';

// Lädt die .env Datei aus dem Root-Verzeichnis des Backends
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_geheimnis_nur_fuer_dev";
export const PORT = process.env.PORT || 4000;

export const DB_CONFIG = {
  name: process.env.DB_NAME as string,
  user: process.env.DB_USER as string,
  pass: process.env.DB_PASSWORD as string,
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT) || 5432,
  isDev: process.env.NODE_ENV === "development"
};

// Sicherheits-Check für Produktion
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn("⚠️ WARNUNG: Kein JWT_SECRET in der .env gefunden!");
}