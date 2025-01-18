import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connexion à la base de données
 */
export const sequelize = new Sequelize({
	dialect: PostgresDialect,
	database: process.env.DB_NAME || "database_name",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT) || 5432,
});
