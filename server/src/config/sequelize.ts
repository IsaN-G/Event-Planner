import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Fehler: DATABASE_URL ist nicht definiert!");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  },
  logging: false 
});

export default sequelize;