import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';

const accountSchema = Joi.object().keys({
  value: Joi.number().greater(0).required(),
});

export default function accountMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = accountSchema.validate(req.body);

  if (error) {
    throw new HttpException(StatusCodes.BAD_REQUEST, error.details[0].message);
  }

  next();
}
