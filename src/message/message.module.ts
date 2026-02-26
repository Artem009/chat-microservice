import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGatewayModule } from '../chat-gateway/chat-gateway.module';
import { ParticipantModule } from '../participant/participant.module';
import { MessageService } from './message.service';
import { CreateMessageController } from './controllers/create-message.controller';
import { ListMessageController } from './controllers/list-message.controller';
import { GetMessageController } from './controllers/get-message.controller';
import { UpdateMessageController } from './controllers/update-message.controller';
import { DeleteMessageController } from './controllers/delete-message.controller';
import { MarkReadController } from './controllers/mark-read.controller';

@Module({
  imports: [PrismaModule, ChatGatewayModule, ParticipantModule],
  controllers: [
    CreateMessageController,
    ListMessageController,
    GetMessageController,
    UpdateMessageController,
    DeleteMessageController,
    MarkReadController,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
