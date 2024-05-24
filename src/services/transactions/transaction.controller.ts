import { Request, Response, NextFunction } from "express";
import * as redis from "redis";
import TransactionService from "./transaction.service";

const redisClient = redis.createClient();
(async () => {
  await redisClient.connect();
})();
class TransactionController {
  private transactionService = new TransactionService();

  public getEthBlockNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = 'blockNumber';
    try {
      // await this.redisClient.connect();
      const ethBlockNumber = await this.transactionService.getEthBlockNumber();
      redisClient.setEx(cacheKey, 30, ethBlockNumber);
      res.status(201).json({data: ethBlockNumber, message: true });
    } catch (error) {
      next(error);
    }
  };

  public getEthBlockByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = 'blockByNumber';
    try {
      const transaction = await this.transactionService.getEthBlockByNumber();
      redisClient.setEx(cacheKey, 30, transaction);
      res.status(201).json({ data: true, message: transaction  });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionController;
