import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ReactionService } from '../reaction.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { MessageService } from '../../message/message.service';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { NotFoundException, ConflictException } from '../../exeption';

@ApiTags('reaction')
@ApiSecurity('authorization')
@Controller('api/reaction')
export class CreateReactionController extends BaseController {
  constructor(
    reactionService: ReactionService,
    chatGateway: ChatGateway,
    messageService: MessageService,
  ) {
    super(reactionService, chatGateway, messageService);
  }

  @Post()
  async create(@Body() dto: CreateReactionDto) {
    const message = await this.messageService.findOne(dto.messageId);
    if (!message || message.deletedAt) {
      throw new NotFoundException('Message not found');
    }

    try {
      const reaction = await this.reactionService.create({
        emoji: dto.emoji,
        userId: dto.userId,
        message: { connect: { id: dto.messageId } },
      });

      this.chatGateway.broadcastToRoom(
        message.conversationId,
        'reactionAdded',
        {
          messageId: dto.messageId,
          userId: dto.userId,
          emoji: dto.emoji,
          type: 'added',
        },
      );

      return { data: reaction };
    } catch (err) {
      if (
        err instanceof Error &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          'User already reacted with this emoji on this message',
        );
      }
      throw err;
    }
  }
}
