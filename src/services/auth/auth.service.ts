
import * as argon2 from 'argon2'
import { HttpException } from '../../exceptions/HttpException';
import { Service } from 'typedi';
import { User } from '../../entity/User';
import { AppDataSource } from '../../data-source';
import { AuthDto } from './dto/auth.dto';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()
@Service()
class AuthenticationService {
  private readonly userRepository = AppDataSource.getRepository(User);

  constructor() {
    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    };

    passport.use(
      new JwtStrategy(opts, (jwt_payload, done) => {

        const user = AppDataSource.manager.findOne((user: { id: User }) => user.id === jwt_payload.sub, null);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      }),
    );
  }
  async generateToken(user: User) {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  }

  authenticate = passport.authenticate('jwt', { session: false });

  /**
   * async login
   */
  public async login(authdto: AuthDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: authdto.email });
    const comparePassword = await argon2.verify(existingUser.password, authdto.password);
    const token = await this.generateToken(existingUser)

    if (!existingUser) {
      throw new HttpException(400, 'User not found');
    }
    if (!comparePassword) {
      throw new HttpException(400, 'Incorrect Password');
    }
    delete existingUser.password;
    this.userRepository.createQueryBuilder().update(User).set({token: token}).where({ email: existingUser.email}).execute();
    return existingUser;
  }

}

export default AuthenticationService;
