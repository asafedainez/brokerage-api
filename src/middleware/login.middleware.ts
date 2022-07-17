import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import Joi from "joi";

const loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

export default function LoginMiddleware(err: Error, req: Request, res: Response, next: NextFunction): Response | void {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
  }
  next();
}