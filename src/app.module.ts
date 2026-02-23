import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [PrismaModule, ConversationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
