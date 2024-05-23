import dotenv from 'dotenv';
import express from 'express';
import TransactionController from './transaction.controller';
dotenv.config();

const router = express.Router();
const transactionController = new TransactionController();
router.post('/get-block-number', transactionController.getEthBlockNumber);
router.post('/get-block-by-number', transactionController.getEthBlockByNumber);

export default router;
