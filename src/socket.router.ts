import dotenv from 'dotenv';
import express from 'express';
import SocketController from './socket.controller';
import Container from 'typedi';
dotenv.config();

const router = express.Router();
const socketController = new SocketController()
router.get('/index', socketController.getIndex);
router.get('/get-socket', socketController.getSocket);

export default router;
