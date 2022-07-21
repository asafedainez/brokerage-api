import { PrismaClient } from '@prisma/client';
import prismaDatabase from '../database';
import IAccountTransaction from '../interfaces/AccountTransaction';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';
import IAccount from '../interfaces/Account';

export default class AccountService {
  private database: PrismaClient;

  constructor() {
    this.database = prismaDatabase;
  }

  async getAccountBalance(id: string): Promise<IAccount> {
    const account = await this.database.accountMovement.findMany({
      where: {
        user: { id },
      },
    });

    if (!account) {
      return {
        balance: 0.0,
      };
    }

    const balance = account.reduce((acc, curr) => {
      return curr.operation === 'DEPOSIT' || curr.operation === 'SELL_ASSET'
        ? acc + Number(curr.value)
        : acc - Number(curr.value);
    }, 0);

    return { balance: Number(balance) };
  }

  async accountDeposit(
    id: string,
    value: number
  ): Promise<IAccountTransaction> {
    if (value <= 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'Value must be greater than zero'
      );
    }

    const account = await this.database.accountMovement.create({
      data: {
        user: { connect: { id } },
        value,
        operation: 'DEPOSIT',
      },
    });

    return {
      id: account.id,
      idUser: account.idUser,
      operation: account.operation,
      value: Number(account.value),
      createdAt: account.createdAt,
    };
  }

  async accountWithdraw(
    id: string,
    value: number
  ): Promise<IAccountTransaction> {
    if (value <= 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'Value must be greater than zero'
      );
    }

    const { balance } = await this.getAccountBalance(id);

    if (balance < value) {
      throw new HttpException(StatusCodes.BAD_REQUEST, 'Insufficient funds');
    }

    const withdrawTransaction = await this.database.accountMovement.create({
      data: {
        user: { connect: { id } },
        value,
        operation: 'WITHDRAW',
      },
    });

    return {
      id: withdrawTransaction.id,
      idUser: withdrawTransaction.idUser,
      operation: withdrawTransaction.operation,
      value: Number(withdrawTransaction.value),
      createdAt: withdrawTransaction.createdAt,
    };
  }
}
