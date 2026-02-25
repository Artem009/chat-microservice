import { Controller, Delete, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { NotFoundException } from '../../exeption';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class DeleteMessageController extends BaseController {
  constructor(messageService: MessageService, chatGateway: ChatGateway) {
    super(messageService, chatGateway);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existing = await this.messageService.findOne(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Message not found');
    }
    const message = await this.messageService.remove(id);
    return { data: message, message: 'Message deleted' };
  }
}
