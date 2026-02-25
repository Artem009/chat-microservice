import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { CreateMessageDto } from '../dto/create-message.dto';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class CreateMessageController extends BaseController {
  constructor(messageService: MessageService, chatGateway: ChatGateway) {
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

    return { data: message };
  }
}
