import express, { Router } from 'express';
import Transaction from '../services/transactions/transaction.router';
import User from '../services/users/user.router';

export const mountRoutePath = (app: { use: (routePath: string, router: Router) => void }) => {
  const apiHandle = express.Router();
  apiHandle.use('/transaction', Transaction);
  apiHandle.use('/user', User);

  app.use('/api/ethereum-transaction', apiHandle);
};
