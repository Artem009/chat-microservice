import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class CreateMessageController extends BaseController {
  constructor(messageService: MessageService) {
    super(messageService);
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
    return { data: message };
  }
}
