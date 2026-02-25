import { Controller, Get, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { NotFoundException } from '../../exeption';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class GetMessageController extends BaseController {
  constructor(messageService: MessageService, chatGateway: ChatGateway) {
    super(messageService, chatGateway);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const message = await this.messageService.findOne(id);
    if (!message || message.deletedAt) {
      throw new NotFoundException('Message not found');
    }
    return { data: message };
  }
}
