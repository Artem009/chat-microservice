import { HttpException, HttpStatus } from '@nestjs/common';
import { Error } from './error-interface';

export class BadRequestException extends HttpException {
  constructor(
    message: string,
    additionalFields?: Error & Record<string, unknown>,
  ) {
    super(
      {
        message,
        error: 'bad_request_exception',
        createdAt: new Date(),
        ...additionalFields,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
