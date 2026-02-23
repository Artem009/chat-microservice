import { Body, Controller, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { ConversationService } from '../conversation.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@ApiTags('conversation')
@ApiSecurity('authorization')
@Controller('api/conversation')
export class CreateConversationController extends BaseController {
  constructor(conversationService: ConversationService) {
    super(conversationService);
  }

  @Post()
  async create(@Body() dto: CreateConversationDto) {
    const conversation = await this.conversationService.create({
      title: dto.title,
      type: dto.type,
      participants: {
        create: [
          { userId: dto.currentUserId, role: 'ADMIN' },
          ...dto.participantIds
            .filter((id) => id !== dto.currentUserId)
            .map((userId) => ({ userId, role: 'MEMBER' as const })),
        ],
      },
    });

    return { data: conversation };
  }
}
