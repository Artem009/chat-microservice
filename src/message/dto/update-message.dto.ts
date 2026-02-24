import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @ApiPropertyOptional({
    description: 'Updated message content',
    example: 'Edited: Hello, how are you?',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
