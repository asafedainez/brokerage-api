import { Request, Response } from 'express';
import UserService from '../services/Users.service';
import IApiRestfulController from '../interfaces/ApiRestfulController';
import { StatusCodes } from 'http-status-codes';
import Auth from '../utils/Auth';
import HttpException from '../utils/HttpException';

export default class UserController implements IApiRestfulController {
  protected userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);
    const user = await this.userService.getById(userId);

    return res.status(StatusCodes.OK).json({ user });
  }

  async create(req: Request, res: Response): Promise<Response> {
    const { cpf, name, email, password } = req.body;

    const token = await this.userService.create({ cpf, name, email, password });

    return res.status(StatusCodes.CREATED).json({ token });
  }

  async update(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);
    const { name, email, cpf } = req.body;

    const userUpdated = await this.userService.update(userId, {
      name,
      email,
      cpf,
    });

    return res.status(StatusCodes.OK).json({ user: userUpdated });
  }

  async remove(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);

    await this.userService.remove(userId);

    return res.status(StatusCodes.NO_CONTENT).json({ message: 'User removed' });
  }

  async getAccountBalance(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);

    const balance = await this.userService.getAccountBalance(userId);

    return res.status(StatusCodes.OK).json({ balance });
  }

  async accountDeposit(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);

    const { value } = req.body;

    const deposit = await this.userService.accountDeposit(userId, value);

    return res.status(StatusCodes.OK).json({ deposit });
  }

  async accountWithdraw(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);

    const { value } = req.body;

    const withdraw = await this.userService.accountWithdraw(userId, value);

    return res.status(StatusCodes.OK).json({ withdraw });
  }

  async getAssets(req: Request, res: Response): Promise<Response> {
    const userId = this.getUserId(req);

    const assets = await this.userService.getAssets(userId);

    return res.status(StatusCodes.OK).json({ assets });
  }

  private getUserId(req: Request): string {
    const userToken = req.headers.authorization?.split('Bearer ')[1];

    if (!userToken) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token not found');
    }

    const userId = Auth.verify(userToken).sub;

    return userId;
  }
}
