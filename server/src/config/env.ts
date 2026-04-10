

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_geheimnis_nur_fuer_dev";
export const PORT = Number(process.env.PORT) || 4000;

export const DB_CONFIG = {
 
  url: process.env.DATABASE_URL as string,
  isDev: process.env.NODE_ENV === "development"
};


if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn("⚠️ WARNUNG: Kein JWT_SECRET in der .env gefunden!");
}