import dotenv from 'dotenv';
import express from 'express';
import TransactionController from './transaction.controller';
import Container from 'typedi';
dotenv.config();


const router = express.Router();
const transactionController = Container.get(TransactionController);
router.post('/get-block-number', transactionController.fetchEthBlockNumber);
router.post('/get-block-by-number', transactionController.fetchEthBlockByNumber);

export default router;
