import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty({
    description: 'Message ID to react to',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsNotEmpty()
  @IsString()
  messageId!: string;

  @ApiProperty({
    description: 'User ID of the reactor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Emoji reaction (e.g. thumbs_up, heart, laugh)',
    example: 'thumbs_up',
  })
  @IsNotEmpty()
  @IsString()
  emoji!: string;
}
