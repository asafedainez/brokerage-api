import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import IApiRestService from '../interfaces/ApiRestService';
import IUser from '../interfaces/User';
import Bcrypt from '../utils/Bcrypt';
import IUserDatabase from '../interfaces/UserDatabase';
import Auth from '../utils/Auth';
import HttpException from '../utils/HttpException';
import IAsset from '../interfaces/Asset';
import prismaDatabase from '../database';
import AccountService from './Account.service';

export default class UserService implements IApiRestService<IUser> {
  protected database: PrismaClient;

  constructor() {
    this.database = prismaDatabase;
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
    const accountService = new AccountService();

    const balance = await accountService.getAccountBalance(id);

    if (balance.balance > 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'User has balance, cannot delete'
      );
    }

    const assets = await this.getAssets(id);

    if (assets.length) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'User has assets, cannot delete'
      );
    }

    await this.database.user.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return true;
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
