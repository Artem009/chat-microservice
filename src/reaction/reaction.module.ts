import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGatewayModule } from '../chat-gateway/chat-gateway.module';
import { MessageModule } from '../message/message.module';
import { ReactionService } from './reaction.service';
import { CreateReactionController } from './controllers/create-reaction.controller';
import { DeleteReactionController } from './controllers/delete-reaction.controller';
import { ListReactionController } from './controllers/list-reaction.controller';

@Module({
  imports: [PrismaModule, ChatGatewayModule, MessageModule],
  controllers: [
    CreateReactionController,
    DeleteReactionController,
    ListReactionController,
  ],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
