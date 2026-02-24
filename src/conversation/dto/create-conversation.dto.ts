import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'Conversation title (for group chats)',
    example: 'Project Discussion',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Conversation type',
    enum: ConversationType,
    default: ConversationType.GROUP,
    example: ConversationType.GROUP,
  })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiProperty({
    description: 'User IDs to add as participants',
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  participantIds!: string[];

  @ApiProperty({
    description: 'Current user ID (from auth in production)',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  currentUserId!: string;
}
