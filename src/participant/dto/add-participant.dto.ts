import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ParticipantRole } from '@prisma/client';

export class AddParticipantDto {
  @ApiProperty({
    description: 'Conversation ID to add participant to',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsNotEmpty()
  @IsString()
  conversationId!: string;

  @ApiProperty({
    description: 'User ID to add as participant',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Participant role',
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER,
    example: ParticipantRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole;
}
