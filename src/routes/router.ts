import express, { Router } from 'express';
import Transaction from '../services/transactions/transaction.router';
import User from '../services/users/user.router';
import Authentication from '../services/auth/auth.router';
import AuthenticationService from "../services/auth/auth.service";
import Socket from '../socket.router';

export const mountRoutePath = (app: { use: (routePath: string, router: Router) => void }) => {
  const apiHandle = express.Router();
  const authenticationService = new AuthenticationService()
  apiHandle.use('/transaction', Transaction);
  apiHandle.use('/user', User);
  apiHandle.use('/auth', Authentication);
  apiHandle.use('/socket', authenticationService.authenticate, Socket);



  app.use('/api/ethereum-transaction', apiHandle);
};
