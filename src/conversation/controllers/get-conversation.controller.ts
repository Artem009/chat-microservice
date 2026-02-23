import { Controller, Get, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ConversationService } from '../conversation.service';
import { NotFoundException } from '../../exeption';

@ApiTags('conversation')
@ApiSecurity('authorization')
@Controller('api/conversation')
export class GetConversationController extends BaseController {
  constructor(conversationService: ConversationService) {
    super(conversationService);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const conversation = await this.conversationService.findOne(id);

    if (!conversation || conversation.deletedAt) {
      throw new NotFoundException('Conversation not found');
    }

    return { data: conversation };
  }
}
