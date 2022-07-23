import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../utils/HttpException';
import Auth from '../utils/Auth';

export default function tokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token not found');
  }

  Auth.verify(token);

  next();
}
