import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message text content',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'Conversation ID to send message in',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsNotEmpty()
  @IsString()
  conversationId!: string;

  @ApiProperty({
    description: 'Sender user ID (from auth in production)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  senderId!: string;
}
