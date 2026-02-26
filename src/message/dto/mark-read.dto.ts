import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarkReadDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  conversationId!: string;

  @ApiProperty({
    description: 'User ID of the participant marking messages as read',
    example: 'f1e2d3c4-b5a6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'ID of the last message that was read',
    example: '12345678-abcd-ef12-3456-7890abcdef12',
  })
  @IsNotEmpty()
  @IsString()
  lastReadMessageId!: string;
}
