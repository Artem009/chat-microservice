import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ConversationService } from '../conversation.service';

@ApiTags('conversation')
@ApiSecurity('authorization')
@Controller('api/conversation')
export class ListConversationController extends BaseController {
  constructor(conversationService: ConversationService) {
    super(conversationService);
  }

  @Get()
  @ApiQuery({ name: 'currentUserId', required: true, type: String })
  async list(@Query('currentUserId') currentUserId: string) {
    const conversations = await this.conversationService.findAll({
      participants: {
        some: { userId: currentUserId, leftAt: null },
      },
    });

    return { data: conversations };
  }
}
