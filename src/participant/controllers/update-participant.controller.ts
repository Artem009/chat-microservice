import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ParticipantService } from '../participant.service';
import { ConversationService } from '../../conversation/conversation.service';
import { UpdateParticipantDto } from '../dto/update-participant.dto';
import { NotFoundException } from '../../exeption';

@ApiTags('participant')
@ApiSecurity('authorization')
@Controller('api/participant')
export class UpdateParticipantController extends BaseController {
  constructor(
    participantService: ParticipantService,
    conversationService: ConversationService,
  ) {
    super(participantService, conversationService);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateParticipantDto) {
    const existing = await this.participantService.findOne(id);
    if (!existing || existing.leftAt) {
      throw new NotFoundException('Participant not found');
    }
    const participant = await this.participantService.update(id, {
      role: dto.role,
    });
    return { data: participant };
  }
}
