import dotenv from "dotenv";
import ms from "ms";
dotenv.config(); // Override if .env is found

const environmentConfig = {
  app: {
    name: process.env.APP_NAME || "Ethereum Transaction Tracker V1",
  },
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUri: process.env.DB_URI,
  database: {
    port: parseInt(process.env.DB_PORT || "3306", 10), // Mysql port
    host: process.env.DB_HOST || "127.0.0.1", // Mysql host
    username: process.env.DB_USERNAME || "default", // Mysql username
    password: process.env.DB_PASSWORD || "my-top-secret", // Mysql password
    db: process.env.DB_NAME || "ethereumtransactions",
    type: process.env.DB_TYPE || "mysql",
  },
};

export default environmentConfig;
