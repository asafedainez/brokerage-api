import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import IApiRestService from '../interfaces/ApiRestService';
import IAsset from '../interfaces/Asset';
import prismaDatabase from '../database';
import HttpException from '../utils/HttpException';
import UserService from './Users.service';
import IOperation from '../interfaces/Operations';
import AccountService from './Account.service';

export default class AssetsService implements IApiRestService<IAsset> {
  protected database: PrismaClient;

  constructor() {
    this.database = prismaDatabase;
  }

  async getAll(): Promise<IAsset[]> {
    const assets = await this.database.asset.findMany();

    const assetsSold = await this.database.operations.findMany();

    const allAssetsWithSoldQuantity = assets.map((asset) => {
      const quantitySold = assetsSold.reduce((total, assetCurr) => {
        if (assetCurr.idAsset === asset.id) {
          return assetCurr.type === 'BUY'
            ? total + assetCurr.quantity
            : total - assetCurr.quantity;
        }
        return total;
      }, 0);

      return {
        idAsset: asset.id,
        assetName: asset.assetName,
        value: Number(asset.value),
        quantity: asset.quantity,
        sold: quantitySold,
      };
    });

    return allAssetsWithSoldQuantity;
  }

  async getById(id: string): Promise<IAsset | null> {
    const asset = await this.database.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new HttpException(StatusCodes.NOT_FOUND, 'Asset not found');
    }

    return {
      idAsset: asset.id,
      assetName: asset.assetName,
      value: Number(asset.value),
      quantity: asset.quantity,
    };
  }

  async create(item: IAsset): Promise<string | boolean> {
    const asset = await this.database.asset.create({
      data: {
        assetName: item.assetName,
        value: item.value,
        quantity: item.quantity,
      },
    });

    return asset.id;
  }

  async update(id: string, item: IAsset): Promise<IAsset> {
    const assetUpdated = await this.database.asset.update({
      where: { id },
      data: {
        assetName: item.assetName,
        value: item.value,
        quantity: item.quantity,
      },
    });

    return {
      idAsset: assetUpdated.id,
      assetName: assetUpdated.assetName,
      value: Number(assetUpdated.value),
      quantity: assetUpdated.quantity,
    };
  }

  async remove(_id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async buyAsset(
    idAsset: string,
    idUser: string,
    quantity: number
  ): Promise<IOperation> {
    const accountService = new AccountService();

    const asset = await this.database.asset.findUnique({
      where: { id: idAsset },
    });

    if (!asset) {
      throw new HttpException(StatusCodes.NOT_FOUND, 'Asset not found');
    }

    if (quantity > asset.quantity) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'Not enough assets to buy'
      );
    }

    const { balance } = await accountService.getAccountBalance(idUser);

    const totalCost = quantity * Number(asset.value);

    if (totalCost > balance) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'Not enough funds to buy this quantity of assets'
      );
    }

    const createOperation = this.database.operations.create({
      data: {
        idUser,
        idAsset,
        quantity,
        purchasePrice: asset.value,
        type: 'BUY',
      },
    });

    const updateQuantityAsset = this.database.asset.update({
      where: { id: idAsset },
      data: {
        quantity: asset.quantity - quantity,
      },
    });

    const createAccountMovement = this.database.accountMovement.create({
      data: {
        idUser,
        value: totalCost,
        operation: 'BUY_ASSET',
      },
    });

    const [operation] = await this.database.$transaction([
      createOperation,
      updateQuantityAsset,
      createAccountMovement,
    ]);

    return {
      id: operation.id,
      idUser,
      idAsset,
      createdAt: operation.createdAt,
      quantity,
      purchasePrice: Number(operation.purchasePrice),
      type: operation.type,
    };
  }

  async sellAsset(
    idAsset: string,
    idUser: string,
    quantity: number
  ): Promise<IOperation> {
    const userService = new UserService();

    const userAssets = await userService.getAssets(idUser);
    const userAsset = userAssets.find((asset) => asset.idAsset === idAsset);

    if (!userAsset) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        'Asset not found in wallet'
      );
    }

    if (userAsset.quantity < quantity) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        'Not enough assets to sell'
      );
    }

    const asset = await this.database.asset.findUnique({
      where: { id: idAsset },
    });

    if (!asset) {
      throw new HttpException(StatusCodes.NOT_FOUND, 'Asset not found');
    }

    const createOperation = this.database.operations.create({
      data: {
        idUser,
        idAsset,
        quantity,
        purchasePrice: asset.value,
        type: 'SELL',
      },
    });

    const updateQuantityAsset = this.database.asset.update({
      where: { id: idAsset },
      data: {
        quantity: asset.quantity + quantity,
      },
    });

    const createAccountMovement = this.database.accountMovement.create({
      data: {
        idUser,
        value: quantity * Number(asset.value),
        operation: 'SELL_ASSET',
      },
    });

    const [operation] = await this.database.$transaction([
      createOperation,
      updateQuantityAsset,
      createAccountMovement,
    ]);

    return {
      id: operation.id,
      idUser,
      idAsset,
      createdAt: operation.createdAt,
      quantity,
      purchasePrice: Number(operation.purchasePrice),
      type: operation.type,
    };
  }
}
