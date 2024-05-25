import dotenv from 'dotenv';
import express from 'express';
import TransactionController from './transaction.controller';
import Container from 'typedi';
dotenv.config();

const router = express.Router();
const transactionController = Container.get(TransactionController);
router.post('/get-block-number', transactionController.getEthBlockNumber);
router.post('/get-block-by-number', transactionController.getEthBlockByNumber);

export default router;
