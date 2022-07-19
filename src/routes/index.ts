import { Router } from 'express';
import loginRouter from './login.routes';

const routes = Router();

routes.use(loginRouter);

export default routes;