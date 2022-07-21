import { Request, Response } from 'express';

export default interface IApiRest {
  getById(req: Request, res: Response): Promise<Response>;
  create(req: Request, res: Response): Promise<Response>;
  update(req: Request, res: Response): Promise<Response>;
  remove(req: Request, res: Response): Promise<Response>;
}
