import Container, { Service } from "typedi";
import UserService from "./user.service";
import { Request, Response, NextFunction } from "express";

@Service()
class UserController {
  private readonly userService = Container.get(UserService);

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = 'blockNumber';
    try {
      const {email, password} = req.body
      const createNewUser = await this.userService.createUser(email, password)
      res.status(200).json({ data: createNewUser, message: true });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
