import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { MentionService } from '../../mention/mention.service';
import { ParticipantService } from '../../participant/participant.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { parseMentions } from '../../mention/mention-parser';
import { NotFoundException } from '../../exeption';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class CreateMessageController extends BaseController {
  constructor(
    messageService: MessageService,
    chatGateway: ChatGateway,
    private readonly mentionService: MentionService,
    private readonly participantService: ParticipantService,
  ) {
    super(messageService, chatGateway);
  }

  @Post()
  async create(@Body() dto: CreateMessageDto) {
    let resolvedParentId = dto.parentMessageId;

    if (resolvedParentId) {
      const parent = await this.messageService.findOne(resolvedParentId);
      if (!parent || parent.deletedAt) {
        throw new NotFoundException('Parent message not found');
      }
      if (parent.conversationId !== dto.conversationId) {
        throw new NotFoundException(
          'Parent message does not belong to this conversation',
        );
      }
      // Flatten: if parent is itself a reply, point to the original parent
      if (parent.parentMessageId) {
        resolvedParentId = parent.parentMessageId;
      }
    }

    const message = await this.messageService.create({
      content: dto.content,
      senderId: dto.senderId,
      conversation: {
        connect: { id: dto.conversationId },
      },
      ...(resolvedParentId && {
        parentMessage: { connect: { id: resolvedParentId } },
      }),
    });

    this.chatGateway.broadcastToRoom(dto.conversationId, 'newMessage', message);

    if (resolvedParentId) {
      this.chatGateway.broadcastToRoom(dto.conversationId, 'threadReply', {
        parentMessageId: resolvedParentId,
        reply: message,
      });
    }

    const parsedUserIds = parseMentions(dto.content);
    let mentions: {
      id: string;
      messageId: string;
      mentionedUserId: string;
      createdAt: Date;
    }[] = [];

    if (parsedUserIds.length > 0) {
      const participants = await this.participantService.findByConversation(
        dto.conversationId,
      );
      const activeParticipantUserIds = new Set(
        participants.map((p) => p.userId),
      );

      const validMentionIds = parsedUserIds.filter(
        (uid) => activeParticipantUserIds.has(uid) && uid !== dto.senderId,
      );

      if (validMentionIds.length > 0) {
        mentions = await this.mentionService.createMany(
          validMentionIds.map((uid) => ({
            messageId: message.id,
            mentionedUserId: uid,
          })),
        );

        this.chatGateway.broadcastToRoom(dto.conversationId, 'userMentioned', {
          messageId: message.id,
          conversationId: dto.conversationId,
          mentionedUserIds: validMentionIds,
        });
      }
    }

    return { data: message, mentions };
  }
}
