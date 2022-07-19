import { Router } from 'express';
import LoginController from '../controllers/Login.controller';
import LoginMiddleware from '../middleware/login.middleware';

const loginController = new LoginController();

const loginRouter = Router();

loginRouter.post('/login', LoginMiddleware, loginController.login);

export default loginRouter;
