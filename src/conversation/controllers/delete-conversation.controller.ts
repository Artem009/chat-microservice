import { Controller, Delete, Param } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ConversationService } from '../conversation.service';
import { NotFoundException } from '../../exeption';

@ApiTags('conversation')
@ApiSecurity('authorization')
@Controller('api/conversation')
export class DeleteConversationController extends BaseController {
  constructor(conversationService: ConversationService) {
    super(conversationService);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existing = await this.conversationService.findOne(id);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Conversation not found');
    }

    const conversation = await this.conversationService.remove(id);

    return { data: conversation, message: 'Conversation deleted' };
  }
}
