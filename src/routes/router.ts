import express, { Router } from 'express';
import Transaction from '../services/transactions/transaction.router'

export const mountRoutePath = (app: { use: (routePath: string, router: Router) => void }) => {
  const apiHandle = express.Router();
  apiHandle.use('/transaction', Transaction);

  app.use('/api/ethereum-transaction', apiHandle);
};
