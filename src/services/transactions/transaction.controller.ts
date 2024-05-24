import { Request, Response, NextFunction } from "express";
import TransactionService from "./transaction.service";


class TransactionController {
  private transactionService = new TransactionService();

  public getEthBlockNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blockNumber = await this.transactionService.getEthBlockNumber();
      res.status(201).json({ data: true, message: { blockNumber: blockNumber } });
    } catch (error) {
      next(error);
    }
  };

  public getEthBlockByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.getEthBlockByNumber();
      res.status(201).json({ data: true, message: transaction  });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionController;
