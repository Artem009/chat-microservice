import { HttpStatus } from '@nestjs/common';
import { BadRequestException } from './bad-request.exception';
import { NotFoundException } from './not-found.exception';

describe('Custom Exceptions', () => {
  describe('BadRequestException', () => {
    it('should have correct response structure', () => {
      const exception = new BadRequestException('Invalid input');
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe('Invalid input');
      expect(response.error).toBe('bad_request_exception');
      expect(response.createdAt).toBeInstanceOf(Date);
    });

    it('should return HTTP 400 status', () => {
      const exception = new BadRequestException('Invalid input');

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should include additional fields', () => {
      const exception = new BadRequestException('Invalid input', {
        field: 'email',
      });
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe('Invalid input');
      expect(response.error).toBe('bad_request_exception');
      expect(response.field).toBe('email');
    });
  });

  describe('NotFoundException', () => {
    it('should have correct response structure', () => {
      const exception = new NotFoundException('Not found');
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe('Not found');
      expect(response.error).toBe('not_found_exception');
      expect(response.createdAt).toBeInstanceOf(Date);
    });

    it('should return HTTP 404 status', () => {
      const exception = new NotFoundException('Not found');

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should include additional fields', () => {
      const exception = new NotFoundException('User not found', {
        userId: '123',
      });
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe('User not found');
      expect(response.error).toBe('not_found_exception');
      expect(response.userId).toBe('123');
    });
  });
});
