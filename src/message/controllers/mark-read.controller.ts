import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { ParticipantService } from '../../participant/participant.service';
import { MarkReadDto } from '../dto/mark-read.dto';
import { NotFoundException } from '../../exeption';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class MarkReadController extends BaseController {
  constructor(
    messageService: MessageService,
    chatGateway: ChatGateway,
    private readonly participantService: ParticipantService,
  ) {
    super(messageService, chatGateway);
  }

  @Post('read')
  async markRead(@Body() dto: MarkReadDto) {
    const participant = await this.participantService.findByConversationAndUser(
      dto.conversationId,
      dto.userId,
    );

    if (!participant || participant.leftAt) {
      throw new NotFoundException('Active participant not found');
    }

    const message = await this.messageService.findOne(dto.lastReadMessageId);

    if (!message || message.deletedAt) {
      throw new NotFoundException('Message not found');
    }

    const updated = await this.participantService.updateLastReadMessage(
      dto.conversationId,
      dto.userId,
      dto.lastReadMessageId,
    );

    this.chatGateway.broadcastToRoom(dto.conversationId, 'readReceipt', {
      conversationId: dto.conversationId,
      userId: dto.userId,
      lastReadMessageId: dto.lastReadMessageId,
    });

    return { data: updated };
  }
}
