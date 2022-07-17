import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import IAuth from '../interfaces/Auth';
import Auth from '../utils/Auth';
import HttpException from '../utils/HttpException';

export default class LoginService implements IAuth {
  protected database: PrismaClient;

  constructor() {
    this.database = new PrismaClient();
  }

  public async login(email: string, password: string): Promise<string> {
    const user = await this.database.user.findOne({
      where: {
        email,
        password,
      },
    });

    if (!user) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'Email or password is incorrect');
    }

    return Auth.sign({ sub: user.id, name: user.name });
  }
}
