import IApiRestfulService from '../interfaces/ApiRestfulService';
import IAsset from '../interfaces/Asset';
import { PrismaClient } from '@prisma/client';
import prismaDatabase from '../database';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';
import UserService from './Users.service';
import IOperation from '../interfaces/Operations';

export default class AssetsService implements IApiRestfulService<IAsset> {
  protected database: PrismaClient;

  constructor() {
    this.database = prismaDatabase;
  }

  async getAll(): Promise<IAsset[]> {
    const assets = await this.database.asset.findMany();

    return assets.map((asset) => {
      return {
        idAsset: asset.id,
        assetName: asset.assetName,
        value: Number(asset.value),
        quantity: asset.quantity,
      };
    });
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

  async remove(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async buyAsset(
    idAsset: string,
    idUser: string,
    quantity: number
  ): Promise<IOperation> {
    const userService = new UserService();

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

    const { balance } = await userService.getAccountBalance(idUser);

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
    id: string,
    idUser: string,
    quantity: number
  ): Promise<IOperation> {
    const userService = new UserService();

    const userAssets = await userService.getAssets(idUser);
    const userAsset = userAssets.find((asset) => asset.idAsset === id);

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
      where: { id },
    });

    if (!asset) {
      throw new HttpException(StatusCodes.NOT_FOUND, 'Asset not found');
    }

    const createOperation = this.database.operations.create({
      data: {
        idUser,
        idAsset: asset.id,
        quantity,
        purchasePrice: asset.value,
        type: 'SELL',
      },
    });

    const updateQuantityAsset = this.database.asset.update({
      where: { id },
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
      idUser: operation.idUser,
      idAsset: operation.idAsset,
      createdAt: operation.createdAt,
      quantity: operation.quantity,
      purchasePrice: Number(operation.purchasePrice),
      type: operation.type,
    };
  }
}
