import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { ParticipantModule } from './participant/participant.module';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';
import { ReactionModule } from './reaction/reaction.module';
import { MentionModule } from './mention/mention.module';

@Module({
  imports: [
    PrismaModule,
    ConversationModule,
    MessageModule,
    ParticipantModule,
    ChatGatewayModule,
    ReactionModule,
    MentionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
