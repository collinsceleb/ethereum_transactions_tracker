import 'reflect-metadata';
import express from "express";
import morgan from "morgan";
import winston from "winston";
import helmet from "helmet";
import { Container } from "typedi";
import fs from "fs";
import path from "path";
import http from "http";
import cors from "cors";
import { mountRoutePath } from "./routes/router";
import passport from "passport";
import { configureSocket } from './routes/socket';
import { EventEmitterService } from './eventEmitter';
import TransactionService from './services/transactions/transaction.service';
import AuthenticationService from './services/auth/auth.service';
import { Server } from 'socket.io';

const createApp = async () => {
  const app: express.Application = express();

  const server = http.createServer(app);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.socket.io', 'http://cdnjs.cloudflare.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'http://localhost:5000'],
        },
      },
    }),
  );

  app.use(
    cors({
      origin: 'http://127.0.0.1:5500', //
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(express.json());
  app.use(passport.initialize());

  winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "error-combined.log" }),
    ],
  });

  const io = new Server(server, {
    cors: {
      origin: 'http://127.0.0.1:5500', // Replace with your frontend domain
      methods: ['GET', 'POST'], // Specify the methods you want to allow
      allowedHeaders: ['Content-Type', 'Authorization'], // Specify the headers you want to allow
      credentials: true, // Include this if you need to send cookies or other credentials
    },
  });

  configureSocket(io);

  const authService = Container.get(AuthenticationService);
  const transactionService = Container.get(TransactionService);

  authService;
  transactionService;
  EventEmitterService.init(io); // Initialize EventEmitterService

  setInterval(() => transactionService.fetchEthBlockByNumber(), 5000);

  // create a write stream (in append mode)
  const accessLogStream = fs.createWriteStream(path.join(__dirname, "error_access.log"), { flags: "a" });

  // setup the logger
  app.use(morgan("combined", { stream: accessLogStream }));

  mountRoutePath(app);

  return server;
}

export default createApp;

