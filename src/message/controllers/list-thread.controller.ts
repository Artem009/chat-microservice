import { Controller, Get, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class ListThreadController extends BaseController {
  constructor(messageService: MessageService, chatGateway: ChatGateway) {
    super(messageService, chatGateway);
  }

  @Get('thread/:parentMessageId')
  async listThread(@Param('parentMessageId') parentMessageId: string) {
    const replies = await this.messageService.findReplies(parentMessageId);
    return { data: replies };
  }
}
