import { Request, Response } from 'express';
import AssetsService from '../services/Assets.service';
import { StatusCodes } from 'http-status-codes';
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
}
