import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocalApiProperty } from '../../common/decorators/local-api-property.decorator';

enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Conversation title (for group chats)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Conversation type',
    enum: ConversationType,
    default: ConversationType.GROUP,
  })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiProperty({
    description: 'User IDs to add as participants',
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  participantIds!: string[];

  @LocalApiProperty({
    description: 'Current user ID (from auth in production)',
  })
  @IsNotEmpty()
  currentUserId!: string;
}
