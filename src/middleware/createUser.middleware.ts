import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import HttpException from '../utils/HttpException';

const userDataSchema = Joi.object().keys({
  cpf: Joi.string().length(11).required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export default function createUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = userDataSchema.validate(req.body);

  if (error) {
    throw new HttpException(StatusCodes.BAD_REQUEST, error.details[0].message);
  }
  next();
}
