import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../utils/HttpException';
import Auth from '../utils/Auth';
import AccountService from '../services/Account.service';

export default class AccountController {
  private static accountService = new AccountService();

  async getAccountBalance(req: Request, res: Response): Promise<Response> {
    const userId = AccountController.getUserId(req);

    const balance = await AccountController.accountService.getAccountBalance(
      userId
    );

    return res.status(StatusCodes.OK).json(balance);
  }

  async accountDeposit(req: Request, res: Response): Promise<Response> {
    const userId = AccountController.getUserId(req);

    const { value } = req.body;

    const deposit = await AccountController.accountService.accountDeposit(
      userId,
      value
    );

    return res.status(StatusCodes.OK).json(deposit);
  }

  async accountWithdraw(req: Request, res: Response): Promise<Response> {
    const userId = AccountController.getUserId(req);

    const { value } = req.body;

    const withdraw = await AccountController.accountService.accountWithdraw(
      userId,
      value
    );

    return res.status(StatusCodes.OK).json(withdraw);
  }

  private static getUserId(req: Request): string {
    const userToken = req.headers.authorization?.split('Bearer ')[1];

    if (!userToken) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token not found');
    }

    const userId = Auth.verify(userToken).sub;

    return userId;
  }
}
