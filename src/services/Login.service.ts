import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import IAuth from '../interfaces/Auth';
import Auth from '../utils/Auth';
import Bcrypt from '../utils/Bcrypt';
import HttpException from '../utils/HttpException';
import prismaDatabase from '../database';

export default class LoginService implements IAuth {
  protected database: PrismaClient;

  constructor() {
    this.database = prismaDatabase;
  }

  public async login(cpf: string, password: string): Promise<string> {
    const bcrypt = new Bcrypt();

    const user = await this.database.user.findFirst({
      where: { cpf },
    });

    if (!user?.active) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'User not active');
    }

    if (!user) {
      throw new HttpException(
        StatusCodes.UNAUTHORIZED,
        'CPF or password is incorrect'
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        StatusCodes.UNAUTHORIZED,
        'CPF or password is incorrect'
      );
    }

    return Auth.sign({ sub: user.id, name: user.name });
  }
}
