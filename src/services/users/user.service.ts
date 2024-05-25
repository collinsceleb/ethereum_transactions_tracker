import axios from "axios";
import { HttpException } from "../../exceptions/HttpException";
import { isEmpty } from "lodash";
import { User } from "../../entity/User";
import { Service } from "typedi";
import * as argon2 from "argon2";
import { AppDataSource } from "../../data-source";


@Service()
class UserService {

  public async createUser(email: string, password: string): Promise<User> {
    if (isEmpty({email, password})) throw new HttpException(400, 'userData is empty');

    // const findUser: IUserSchema = (this.users.findOne((user: { email: string; }) => user.email === userData.email)) as unknown as IUserSchema;
    // console.log(findUser)
    // if (!findUser) throw new HttpException(409, `This email ${userData.email} already exists`);
    // this.throwErrorIfUserExist(userData.email);

    const hashedPassword = await argon2.hash(password);
    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.token = "";
    await AppDataSource.manager.save(newUser);
    delete newUser.password;
    delete newUser.token;
    return newUser;
  }
}

export default UserService;
