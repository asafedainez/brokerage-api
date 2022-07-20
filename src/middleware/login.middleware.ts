import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import HttpException from '../utils/HttpException';

const loginSchema = Joi.object()
  .keys({
    cpf: Joi.string().length(11).required(),
    password: Joi.string().min(8).required(),
  })
  .required();

export default function LoginMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, error.details[0].message);
  }

  next();
}
