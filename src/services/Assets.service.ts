import IApiRestfulService from '../interfaces/ApiRestfulService';
import IAsset from '../interfaces/Asset';
import { PrismaClient } from '@prisma/client';
import prismaDatabase from '../database';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';

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
}
