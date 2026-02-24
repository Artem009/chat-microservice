import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ParticipantService } from '../participant.service';
import { AddParticipantDto } from '../dto/add-participant.dto';
import { ConflictException } from '../../exeption';

@ApiTags('participant')
@ApiSecurity('authorization')
@Controller('api/participant')
export class AddParticipantController extends BaseController {
  constructor(participantService: ParticipantService) {
    super(participantService);
  }

  @Post()
  async add(@Body() dto: AddParticipantDto) {
    const existing = await this.participantService.findByConversationAndUser(
      dto.conversationId,
      dto.userId,
    );

    if (existing && !existing.leftAt) {
      throw new ConflictException('User is already a participant');
    }

    if (existing && existing.leftAt) {
      const participant = await this.participantService.update(existing.id, {
        leftAt: null,
        role: dto.role ?? 'MEMBER',
      });
      return { data: participant };
    }

    const participant = await this.participantService.create({
      userId: dto.userId,
      role: dto.role ?? 'MEMBER',
      conversation: { connect: { id: dto.conversationId } },
    });
    return { data: participant };
  }
}
