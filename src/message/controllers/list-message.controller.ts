import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class ListMessageController extends BaseController {
  constructor(messageService: MessageService, chatGateway: ChatGateway) {
    super(messageService, chatGateway);
  }

  @Get()
  @ApiQuery({
    name: 'conversationId',
    required: true,
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  async list(
    @Query('conversationId') conversationId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const messages = await this.messageService.findAll(
      { conversationId },
      {
        take: take ? Number(take) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
    );
    return { data: messages };
  }
}
