import { Router } from 'express';
import AssetController from '../controllers/Asset.controller';
import assetMiddleware from '../middleware/asset.middleware';
import tokenMiddleware from '../middleware/token.middleware';
import operateAssetMiddleware from '../middleware/operateAsset.middleware';

const assetController = new AssetController();

const assetRouter = Router();

assetRouter.post(
  '/asset/buy',
  tokenMiddleware,
  operateAssetMiddleware,
  assetController.buyAsset
);
assetRouter.post(
  '/asset/sell',
  tokenMiddleware,
  operateAssetMiddleware,
  assetController.sellAsset
);

assetRouter.get('/asset/:id', assetController.getById);
assetRouter.get('/assets', assetController.getAll);
assetRouter.post('/asset', assetMiddleware, assetController.create);
assetRouter.put('/asset/:id', assetMiddleware, assetController.update);

export default assetRouter;
