import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import LoginService from '../services/Login.service';

export default class LoginController {
  async login(req: Request, res: Response): Promise<Response> {
    const loginService = new LoginService();
    const { cpf, password } = req.body;
    const token = await loginService.login(cpf, password);
    return res.status(StatusCodes.OK).json({ token });
  }
}
