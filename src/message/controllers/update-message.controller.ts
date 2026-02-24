import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from './base.controller';
import { MessageService } from '../message.service';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { NotFoundException } from '../../exeption';

@ApiTags('message')
@ApiSecurity('authorization')
@Controller('api/message')
export class UpdateMessageController extends BaseController {
  constructor(messageService: MessageService) {
    super(messageService);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    const existing = await this.messageService.findOne(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Message not found');
    }
    const message = await this.messageService.update(id, dto);
    return { data: message };
  }
}
