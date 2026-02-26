import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TypingDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  conversationId!: string;

  @ApiProperty({
    description: 'User ID of the person typing',
    example: 'f1e2d3c4-b5a6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
