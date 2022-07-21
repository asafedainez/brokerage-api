import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';

const assetSchema = Joi.object().keys({
  assetName: Joi.string().length(5).required(),
  value: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).required(),
});

export default function assetMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = assetSchema.validate(req.body);

  if (error) {
    throw new HttpException(StatusCodes.BAD_REQUEST, error.details[0].message);
  }

  next();
}
