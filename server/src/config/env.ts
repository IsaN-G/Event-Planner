// Wir brauchen hier kein dotenv.config() mehr, da Bun das automatisch macht.

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_geheimnis_nur_fuer_dev";
export const PORT = Number(process.env.PORT) || 4000;

export const DB_CONFIG = {
  // Wir nutzen primär die DATABASE_URL in der sequelize.ts, 
  // aber lassen diese Felder als Backup hier:
  url: process.env.DATABASE_URL as string,
  isDev: process.env.NODE_ENV === "development"
};

// Sicherheits-Check für Produktion
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn("⚠️ WARNUNG: Kein JWT_SECRET in der .env gefunden!");
}