import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MentionService } from './mention.service';
import { ListMentionController } from './controllers/list-mention.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ListMentionController],
  providers: [MentionService],
  exports: [MentionService],
})
export class MentionModule {}
