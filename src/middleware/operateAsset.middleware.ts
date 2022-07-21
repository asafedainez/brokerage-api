import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import HttpException from '../utils/HttpException';
import { StatusCodes } from 'http-status-codes';

const opAssetSchema = Joi.object().keys({
  idAsset: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
});

export default function operateAssetMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = opAssetSchema.validate(req.body);

  if (error) {
    throw new HttpException(StatusCodes.BAD_REQUEST, error.details[0].message);
  }

  next();
}
