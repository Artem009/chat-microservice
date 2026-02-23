import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export class UpdateConversationDto {
  @ApiPropertyOptional({ description: 'Conversation title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Conversation type',
    enum: ConversationType,
  })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;
}
