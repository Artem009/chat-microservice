import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MentionService } from '../mention.service';

@ApiTags('mention')
@ApiSecurity('authorization')
@Controller('api/mention')
export class ListMentionController extends BaseController {
  constructor(mentionService: MentionService) {
    super(mentionService);
  }

  @Get()
  @ApiQuery({
    name: 'messageId',
    required: false,
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  async list(
    @Query('messageId') messageId?: string,
    @Query('userId') userId?: string,
  ) {
    if (messageId) {
      const mentions = await this.mentionService.findByMessage(messageId);
      return { data: mentions };
    }

    if (userId) {
      const mentions = await this.mentionService.findByUser(userId);
      return { data: mentions };
    }

    return { data: [] };
  }
}
