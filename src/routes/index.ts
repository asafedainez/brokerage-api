import { Router } from 'express';
import assetRouter from './asset.routes';
import loginRouter from './login.routes';
import userRouter from './user.routes';

const routes = Router();

routes.use(loginRouter);
routes.use(userRouter);
routes.use(assetRouter);

export default routes;
