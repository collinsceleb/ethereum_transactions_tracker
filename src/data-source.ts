import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import dotenv from "dotenv";
import { Transaction } from "./entity/Transaction";
import { RefreshToken } from "./entity/RefreshToken";
import { Device } from "./entity/Device";


dotenv.config()

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Transaction, RefreshToken, Device],
  migrations: [],
  subscribers: [],
});
