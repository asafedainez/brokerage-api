import { Router } from 'express';
import AssetController from '../controllers/Asset.controller';
import assetMiddleware from '../middleware/asset.middleware';
import tokenMiddleware from '../middleware/token.middleware';
import operateAssetMiddleware from '../middleware/operateAsset.middleware';

const assetController = new AssetController();

const assetRouter = Router();

assetRouter.post(
  'assets/buy',
  tokenMiddleware,
  operateAssetMiddleware,
  assetController.buyAsset
);
assetRouter.post(
  'assets/sell',
  tokenMiddleware,
  operateAssetMiddleware,
  assetController.sellAsset
);

assetRouter.get('/assets/:id', assetController.getById);
assetRouter.get('/assets', assetController.getAll);
assetRouter.post('/assets', assetMiddleware, assetController.create);
assetRouter.put('/assets/:id', assetMiddleware, assetController.update);

export default assetRouter;
