import { Router } from 'express';
import UserController from '../controllers/User.controller';
import createUserMiddleware from '../middleware/createUser.middleware';
import tokenMiddleware from '../middleware/token.middleware';

const userController = new UserController();

const userRouter = Router();

userRouter.get(
  '/user/account',
  tokenMiddleware,
  userController.getAccountBalance
);
userRouter.post(
  '/user/account/deposit',
  tokenMiddleware,
  userController.accountDeposit
);
userRouter.post(
  '/user/account/withdraw',
  tokenMiddleware,
  userController.accountWithdraw
);

userRouter.get('/user/assets', tokenMiddleware, userController.getAssets);

userRouter.get('/user', tokenMiddleware, userController.getById);
userRouter.post('/user', createUserMiddleware, userController.create);
userRouter.put('/user', tokenMiddleware, userController.update);
userRouter.delete('/user', tokenMiddleware, userController.remove);

export default userRouter;
