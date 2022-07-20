import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

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
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message });
  }
  next();
}
