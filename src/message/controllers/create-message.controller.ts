import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { MentionService } from '../../mention/mention.service';
import { ParticipantService } from '../../participant/participant.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { parseMentions } from '../../mention/mention-parser';

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
    const message = await this.messageService.create({
      content: dto.content,
      senderId: dto.senderId,
      conversation: {
        connect: { id: dto.conversationId },
      },
    });

    this.chatGateway.broadcastToRoom(dto.conversationId, 'newMessage', message);

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
