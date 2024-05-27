import { Request, Response, NextFunction } from "express";
import * as redis from "redis";
import TransactionService from "./transaction.service";
import Container, { Service } from "typedi";


@Service()
class TransactionController {
  private readonly transactionService = Container.get(TransactionService);

   async fetchEthBlockNumber(req: Request, res: Response, next: NextFunction): Promise<void>{
    try {
      // await this.redisClient.connect();
      const ethBlockNumber = await this.transactionService.fetchEthBlockNumber();
      res.status(200).json({ data: ethBlockNumber, message: true });
    } catch (error) {
      next(error);
    }
  };

   async fetchEthBlockByNumber(req: Request, res: Response, next: NextFunction): Promise<void>{
    try {
      const transaction = await this.transactionService.fetchEthBlockByNumber();
      res.status(200).json({ data: true, message: transaction });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionController;
