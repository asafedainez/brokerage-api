import { Request, Response } from 'express';

export default interface IApiRestfulController {
  getById(req: Request, res: Response): Promise<Response>;
  create(req: Request, res: Response): Promise<Response>;
  update(req: Request, res: Response): Promise<Response>;
  remove(req: Request, res: Response): Promise<Response>;
  getAccountBalance(req: Request, res: Response): Promise<Response>;
  accountDeposit(req: Request, res: Response): Promise<Response>;
  accountWithdraw(req: Request, res: Response): Promise<Response>;
  getAssets(req: Request, res: Response): Promise<Response>;
}
