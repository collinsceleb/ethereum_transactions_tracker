import { Request, Response, NextFunction } from "express";
import * as redis from "redis";
import TransactionService from "./transaction.service";
import Container, { Service } from "typedi";

Container.set('RedisClient', redis.createClient());

const redisClient = Container.get<redis.RedisClientType>('RedisClient');
(async () => {
  await redisClient.connect();
})();

redisClient.on('error', err => {
  console.error('Redis error:', err);
});

@Service()
class TransactionController {
  private readonly transactionService = Container.get(TransactionService);

  public getEthBlockNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = 'blockNumber';
    try {
      // await this.redisClient.connect();
      const ethBlockNumber = await this.transactionService.getEthBlockNumber();
      redisClient.set(cacheKey, 30, ethBlockNumber);
      res.status(200).json({ data: ethBlockNumber, message: true });
    } catch (error) {
      next(error);
    }
  };

  public getEthBlockByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = 'blockByNumber';
    try {
      const transaction = await this.transactionService.getEthBlockByNumber();
      redisClient.set(cacheKey, 30, transaction);
      res.status(200).json({ data: true, message: transaction });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionController;
