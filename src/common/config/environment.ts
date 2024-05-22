import dotenv from "dotenv";
import ms from "ms";
dotenv.config(); // Override if .env is found

const environmentConfig = {
  app: {
    name: process.env.APP_NAME || "Medication Manager V1",
  },
  auth: {
    lockerRetries: 5,
    lockerExpiry: ms("30 minutes"),
    tokenExpiry: ms("1 day"),
    refreshTokenExpiry: ms("30 days"),
    codeExpiry: ms("5 minutes"),
    secret: process.env.jwtSecret || "this+is+no+secret+at+all",
  },
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUri: process.env.DB_URI,
  database: {
    port: parseInt(process.env.DB_PORT || "27017", 10), // Mongo port
    host: process.env.DB_HOST || "127.0.0.1", // Mongo host
    username: process.env.DB_USER || "default", // Mongo username
    password: process.env.DB_PASS || "my-top-secret", // Mongo password
    db: process.env.DB_NAME || "medication-manager",
    sandboxDatabase: process.env.sandboxDatabase,
    productionDatabase: process.env.productionDatabase,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || process.env.sendgridApiKey || "",
    domain: process.env.SENDGRID_DOMAIN || "wayamoney.com",
  },
  // cors: {
  //   origin: [...(process.env.ORIGIN?.split(",") ?? ["*"]), "https://admin.socket.io"],
  //   allowedHeaders: [
  //     "app-name",
  //     "app-version",
  //     "device-id",
  //     "user-lang",
  //     "x-api-key",
  //   ],
  //   credentials: process.env.CREDENTIALS === "true",
  // },
  // redis: {
  //   port: parseInt(process.env.REDIS_PORT || "6379", 10), // Redis port
  //   host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
  //   username: process.env.REDIS_USER || "default", // Redis username
  //   password: process.env.REDIS_PASS || "my-top-secret", // Redis password
  //   db: 0,
  // },
};

export default environmentConfig;
