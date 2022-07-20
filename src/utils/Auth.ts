import { StatusCodes } from 'http-status-codes';
import { Secret, sign, SignOptions, verify } from 'jsonwebtoken';
import IJWTPayload from '../interfaces/JwtPayload';
import HttpException from './HttpException';

const { JWT_SECRET } = process.env;

export default class JWTService {
  private static signOptions: SignOptions = {
    expiresIn: '1h',
    algorithm: 'HS256',
  };

  public static sign(payload: IJWTPayload): string {
    return sign(payload, JWT_SECRET as Secret, JWTService.signOptions);
  }

  public static verify(token: string): IJWTPayload {
    try {
      const decoded = verify(token, JWT_SECRET as Secret);
      return decoded as IJWTPayload;
    } catch (error) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
  }
}
