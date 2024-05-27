import { Request, Response, NextFunction } from "express";
import { HttpException } from "./exceptions/HttpException";
import path from "path";

class SocketController {
  public getIndex = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const __dirname = dirname(fileURLToPath(import.meta.url));
    try {
      const filePath = path.join(__dirname, '../public', 'index.html');
      console.log('filePath:', filePath);

      res.sendFile(path.join(__dirname, '../public', 'index.html'));
    } catch (error) {
      throw new HttpException(400, error);
    }
  }
  public getSocket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const __dirname = dirname(fileURLToPath(import.meta.url));
    try {
      res.redirect('/api/ethereum-transaction/socket/index');
    } catch (error) {
      throw new HttpException(400, error);
    }
  }
}

export default SocketController;
