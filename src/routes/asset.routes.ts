import { Router } from 'express';
import AssetController from '../controllers/Asset.controller';
import tokenMiddleware from '../middleware/token.middleware';

const assetController = new AssetController();

const assetRouter = Router();

assetRouter.post('assets/buy', tokenMiddleware, assetController.buyAsset);
assetRouter.post('assets/sell', tokenMiddleware, assetController.sellAsset);

assetRouter.get('/assets/:id', assetController.getById);
assetRouter.get('/assets', assetController.getAll);
assetRouter.post('/assets', assetController.create);
assetRouter.put('/assets/:id', assetController.update);

export default assetRouter;