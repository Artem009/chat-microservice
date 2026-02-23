import { HttpException, HttpStatus } from '@nestjs/common';
import { Error } from './error-interface';

export class NotFoundException extends HttpException {
  constructor(
    message: string,
    additionalFields?: Error & Record<string, unknown>,
  ) {
    super(
      {
        message,
        error: 'not_found_exception',
        createdAt: new Date(),
        ...additionalFields,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
