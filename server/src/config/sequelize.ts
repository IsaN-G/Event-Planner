import { Sequelize } from "sequelize";
import pg from "pg";
import { DB_CONFIG } from "./env";

const sequelize = new Sequelize(
  DB_CONFIG.name,
  DB_CONFIG.user,
  DB_CONFIG.pass,
  {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    dialect: "postgres",
    dialectModule: pg,
    logging: DB_CONFIG.isDev,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;