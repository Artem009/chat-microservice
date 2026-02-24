import { HttpException, HttpStatus } from '@nestjs/common';
import { Error } from './error-interface';

export class ConflictException extends HttpException {
  constructor(
    message: string,
    additionalFields?: Error & Record<string, unknown>,
  ) {
    super(
      {
        message,
        error: 'conflict_exception',
        createdAt: new Date(),
        ...additionalFields,
      },
      HttpStatus.CONFLICT,
    );
  }
}
