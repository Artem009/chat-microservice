import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ConversationService } from '../conversation.service';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { NotFoundException } from '../../exeption';

@ApiTags('conversation')
@ApiSecurity('authorization')
@Controller('api/conversation')
export class UpdateConversationController extends BaseController {
  constructor(conversationService: ConversationService) {
    super(conversationService);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateConversationDto) {
    const existing = await this.conversationService.findOne(id);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Conversation not found');
    }

    const conversation = await this.conversationService.update(id, dto);

    return { data: conversation };
  }
}
