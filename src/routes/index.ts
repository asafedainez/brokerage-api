import { Router, Request, Response } from 'express';
import assetRouter from './asset.routes';
import loginRouter from './login.routes';
import userRouter from './user.routes';
import accountRouter from './account.routes';

const routes = Router();

routes.use(loginRouter);
routes.use(userRouter);
routes.use(assetRouter);
routes.use(accountRouter);

routes.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1>Brokerage API</h1><ul><li><a href="https://brokerageapi.herokuapp.com/docs" target="_blank">Documentação</a></li><li><a href="https://github.com/asafedainez/brokerage-api.git" target="_blank">Repositório GitHub</a></li></ul>'
  );
});

export default routes;
