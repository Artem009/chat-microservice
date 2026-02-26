import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ReactionService } from '../reaction.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { MessageService } from '../../message/message.service';

@ApiTags('reaction')
@ApiSecurity('authorization')
@Controller('api/reaction')
export class ListReactionController extends BaseController {
  constructor(
    reactionService: ReactionService,
    chatGateway: ChatGateway,
    messageService: MessageService,
  ) {
    super(reactionService, chatGateway, messageService);
  }

  @Get()
  @ApiQuery({
    name: 'messageId',
    required: true,
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  async list(@Query('messageId') messageId: string) {
    const reactions = await this.reactionService.findAll({ messageId });
    return { data: reactions };
  }
}
