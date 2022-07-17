import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type HttpException from '../utils/HttpException';

function errorMiddleware(error: Error, req: Request, res: Response, _next: NextFunction) {
  const { status, message } = error as HttpException;

  res.status(status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
}

export default errorMiddleware;
