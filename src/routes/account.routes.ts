import { Router } from 'express';
import AccountController from '../controllers/Account.controller';
import tokenMiddleware from '../middleware/token.middleware';
import accountMiddleware from '../middleware/account.middleware';

const accountController = new AccountController();

const accountRouter = Router();

accountRouter.get(
  '/account',
  tokenMiddleware,
  accountController.getAccountBalance
);
accountRouter.post(
  '/account/deposit',
  tokenMiddleware,
  accountMiddleware,
  accountController.accountDeposit
);
accountRouter.post(
  '/account/withdraw',
  tokenMiddleware,
  accountMiddleware,
  accountController.accountWithdraw
);

export default accountRouter;
