import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationService } from './conversation.service';
import { CreateConversationController } from './controllers/create-conversation.controller';
import { ListConversationController } from './controllers/list-conversation.controller';
import { GetConversationController } from './controllers/get-conversation.controller';
import { UpdateConversationController } from './controllers/update-conversation.controller';
import { DeleteConversationController } from './controllers/delete-conversation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateConversationController,
    ListConversationController,
    GetConversationController,
    UpdateConversationController,
    DeleteConversationController,
  ],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
