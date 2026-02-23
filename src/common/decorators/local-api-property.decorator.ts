import { applyDecorators } from '@nestjs/common';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ENV_MODE } from '../constants/mode';

/** Use to display field in swagger only in LOCAL mode */
const isLocalMode = process.env.MODE === ENV_MODE.LOCAL;

export function LocalApiProperty(options: Parameters<typeof ApiProperty>[0]) {
  return applyDecorators(
    IsString(),
    ...(isLocalMode ? [ApiProperty(options)] : []),
  );
}
