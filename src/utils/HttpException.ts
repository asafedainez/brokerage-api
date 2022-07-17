import { StatusCodes } from 'http-status-codes';

class HttpException extends Error {
  status: StatusCodes;

  constructor(status: StatusCodes, message: string) {
    super(message);
    this.status = status;
  }
}

export default HttpException;
