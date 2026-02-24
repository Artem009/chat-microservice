import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ParticipantRole } from '@prisma/client';

export class UpdateParticipantDto {
  @ApiProperty({
    description: 'New participant role',
    enum: ParticipantRole,
    example: ParticipantRole.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(ParticipantRole)
  role!: ParticipantRole;
}
