import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Fehler: DATABASE_URL ist nicht definiert!");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Das ist der entscheidende Schalter
    }
  },
  // Wichtig für PgBouncer (Port 6543)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false,
});

export default sequelize;