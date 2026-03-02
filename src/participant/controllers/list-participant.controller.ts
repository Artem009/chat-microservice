import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ParticipantService } from '../participant.service';
import { ConversationService } from '../../conversation/conversation.service';

@ApiTags('participant')
@ApiSecurity('authorization')
@Controller('api/participant')
export class ListParticipantController extends BaseController {
  constructor(
    participantService: ParticipantService,
    conversationService: ConversationService,
  ) {
    super(participantService, conversationService);
  }

  @Get()
  @ApiQuery({
    name: 'conversationId',
    required: true,
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  async list(@Query('conversationId') conversationId: string) {
    const participants =
      await this.participantService.findByConversation(conversationId);
    return { data: participants };
  }
}
