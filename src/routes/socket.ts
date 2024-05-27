import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { EventEmitterService } from '../eventEmitter';
import dotenv from 'dotenv';
import { User } from '../entity/User';

dotenv.config()

const secretKey = process.env.JWT_SECRET_KEY;
const eventEmitterService = Container.get(EventEmitterService);

export const configureSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, secretKey, (err: Error, decoded: User) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.data.user = decoded;
      next();
    });
  });

  io.on('connection', socket => {
    console.log('New client connected');

    socket.on('subscribe', async (subscription: string) => {
      console.log('Subscription received:', subscription);
      socket.join(subscription);
      const cachedEvents = await EventEmitterService.getCachedEvents(subscription);
      cachedEvents.forEach(event => {
        socket.emit('event', event);
      });
    });

    socket.on('unsubscribe', (subscription: string) => {
      console.log('Unsubscription received:', subscription);
      socket.leave(subscription);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
