import { Router } from 'express';
import loginRouter from './login.routes';
import userRouter from './user.routes';

const routes = Router();

routes.use(loginRouter);
routes.use(userRouter);

export default routes;
