import dotenv from 'dotenv';
import express from 'express';
import SocketController from './socket.controller';
import Container from 'typedi';
dotenv.config();

const router = express.Router();
router.get('/index', SocketController.getIndex);
router.get('/get-socket', SocketController.getSocket);

export default router;
