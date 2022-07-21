import { Request, Response } from 'express';
import AssetsService from '../services/Assets.service';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../utils/HttpException';
import Auth from '../utils/Auth';

export default class AssetController {
  private static assetService = new AssetsService();

  async getAll(req: Request, res: Response): Promise<Response> {
    const assets = await AssetController.assetService.getAll();

    return res.status(StatusCodes.OK).json(assets);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    const asset = await AssetController.assetService.getById(id);

    return res.status(StatusCodes.OK).json(asset);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const { assetName, value, quantity } = req.body;

    const id = await AssetController.assetService.create({
      assetName,
      value,
      quantity,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ id, assetName, value, quantity });
  }

  async update(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    const { assetName, value, quantity } = req.body;

    const assetUpdated = await AssetController.assetService.update(id, {
      assetName,
      value,
      quantity,
    });

    return res.status(StatusCodes.OK).json(assetUpdated);
  }

  private static getUserId(req: Request): string {
    const userToken = req.headers.authorization?.split('Bearer ')[1];

    if (!userToken) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token not found');
    }

    const userId = Auth.verify(userToken).sub;

    return userId;
  }
}
