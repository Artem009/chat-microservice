import { Controller, Delete, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ReactionService } from '../reaction.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { MessageService } from '../../message/message.service';
import { NotFoundException } from '../../exeption';

@ApiTags('reaction')
@ApiSecurity('authorization')
@Controller('api/reaction')
export class DeleteReactionController extends BaseController {
  constructor(
    reactionService: ReactionService,
    chatGateway: ChatGateway,
    messageService: MessageService,
  ) {
    super(reactionService, chatGateway, messageService);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existing = await this.reactionService.findOne(id);
    if (!existing) {
      throw new NotFoundException('Reaction not found');
    }

    const reaction = await this.reactionService.remove(id);

    const message = await this.messageService.findOne(existing.messageId);
    if (message) {
      this.chatGateway.broadcastToRoom(
        message.conversationId,
        'reactionRemoved',
        {
          messageId: existing.messageId,
          userId: existing.userId,
          emoji: existing.emoji,
          type: 'removed',
        },
      );
    }

    return { data: reaction, message: 'Reaction removed' };
  }
}
