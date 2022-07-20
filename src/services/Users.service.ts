import IApiRestful from '../interfaces/ApiRestful';
import IUser from '../interfaces/User';
import { PrismaClient } from '@prisma/client';
import Bcrypt from '../utils/Bcrypt';
import IUserDatabase from '../interfaces/UserDatabase';
import Auth from '../utils/Auth';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';
import IAccount from '../interfaces/Account';
import IAccountTransaction from '../interfaces/AccountTransaction';
import IAsset from '../interfaces/Asset';

export default class UserService implements IApiRestful<IUser> {
  protected database: PrismaClient;

  constructor() {
    this.database = new PrismaClient();
  }

  async getAll(): Promise<IUser[] | void[]> {
    const users = await this.database.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    const usersFiltered = users.map((user) => {
      user.id, user.name, user.cpf, user.email;
    });

    return usersFiltered;
  }

  async getById(id: string): Promise<IUser | null> {
    const user = await this.database.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(StatusCodes.NOT_FOUND, 'User not found');
    }

    return {
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  }

  async create(item: IUserDatabase): Promise<string | boolean> {
    const bcrypt = new Bcrypt();

    const passwordHash = await bcrypt.genHash(item.password);

    const user = await this.database.user.create({
      data: {
        name: item.name,
        email: item.email,
        cpf: item.cpf,
        password: passwordHash,
      },
    });

    return Auth.sign({ sub: user.id, name: user.name });
  }

  async update(id: string, item: IUser): Promise<IUser> {
    const userUpdated = await this.database.user.update({
      where: { id },
      data: {
        name: item.name,
        email: item.email,
        updatedAt: new Date(),
      },
    });

    return {
      name: userUpdated.name,
      email: userUpdated.email,
      cpf: userUpdated.cpf,
    };
  }

  async remove(id: string): Promise<boolean> {
    await this.database.user.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return true;
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
    const { balance } = await this.getAccountBalance(id);

    if (value < balance) {
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

  async getAssets(id: string): Promise<IAsset[]> {
    const assets: IAsset[] = [];
    const assetsOps = await this.database.operations.findMany({
      where: {
        user: { id },
      },
      include: {
        asset: true,
      },
    });

    const assetsIds = assetsOps.map((asset) => {
      return asset.idAsset;
    });
    const assetsIdsSet = new Set(assetsIds);

    assetsIdsSet.forEach((assetId) => {
      const allAssetsOpsById = assetsOps.filter(
        (assetOp) => assetOp.idAsset === assetId
      );

      const assetWithQuantity = allAssetsOpsById.reduce(
        (acc, curr) => {
          return {
            idAsset: curr.idAsset,
            assetName: curr.asset.assetName,
            value: curr.asset.value,
            quantity:
              curr.type === 'BUY'
                ? acc.quantity + curr.quantity
                : acc.quantity - curr.quantity,
          };
        },
        { quantity: 0 }
      );
      if (assetWithQuantity.quantity) {
        assets.push(assetWithQuantity as IAsset);
      }
    });

    return assets;
  }
}
