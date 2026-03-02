import { Controller, Delete, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ParticipantService } from '../participant.service';
import { ConversationService } from '../../conversation/conversation.service';
import { NotFoundException } from '../../exeption';

@ApiTags('participant')
@ApiSecurity('authorization')
@Controller('api/participant')
export class RemoveParticipantController extends BaseController {
  constructor(
    participantService: ParticipantService,
    conversationService: ConversationService,
  ) {
    super(participantService, conversationService);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existing = await this.participantService.findOne(id);
    if (!existing || existing.leftAt) {
      throw new NotFoundException('Participant not found');
    }
    const participant = await this.participantService.remove(id);
    return { data: participant, message: 'Participant removed' };
  }
}
