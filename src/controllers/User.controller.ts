import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserService from '../services/Users.service';
import IApiRestController from '../interfaces/ApiRestController';
import Auth from '../utils/Auth';
import HttpException from '../utils/HttpException';

export default class UserController implements IApiRestController {
  protected static userService = new UserService();

  // constructor() {
  //   this.userService = new UserService();
  // }

  private static getUserId(req: Request): string {
    const userToken = req.headers.authorization?.split('Bearer ')[1];

    if (!userToken) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token not found');
    }

    const userId = Auth.verify(userToken).sub;

    return userId;
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const userId = UserController.getUserId(req);

    const user = await UserController.userService.getById(userId);

    return res.status(StatusCodes.OK).json(user);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const { cpf, name, email, password } = req.body;

    const token = await UserController.userService.create({
      cpf,
      name,
      email,
      password,
    });

    return res.status(StatusCodes.CREATED).json({ token });
  }

  async update(req: Request, res: Response): Promise<Response> {
    const userId = UserController.getUserId(req);
    const { name, email, cpf } = req.body;

    const userUpdated = await UserController.userService.update(userId, {
      name,
      email,
      cpf,
    });

    return res.status(StatusCodes.OK).json(userUpdated);
  }

  async remove(req: Request, res: Response): Promise<Response> {
    const userId = UserController.getUserId(req);

    await UserController.userService.remove(userId);

    return res.status(StatusCodes.NO_CONTENT).end();
  }

  async getAssets(req: Request, res: Response): Promise<Response> {
    const userId = UserController.getUserId(req);

    const assets = await UserController.userService.getAssets(userId);

    return res.status(StatusCodes.OK).json(assets);
  }
}
