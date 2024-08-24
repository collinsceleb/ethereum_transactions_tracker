import Container, { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import AuthenticationService from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Service()
class AuthenticationController {
  private readonly authService = Container.get(AuthenticationService);

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authdto: AuthDto = req.body;
      const loginUser = await this.authService.login(authdto, req);
      res.status(200).json({ data: loginUser, message: true });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthenticationController;
