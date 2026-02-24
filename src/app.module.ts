import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { ParticipantModule } from './participant/participant.module';

@Module({
  imports: [PrismaModule, ConversationModule, MessageModule, ParticipantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
