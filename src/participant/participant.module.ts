import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationModule } from '../conversation/conversation.module';
import { ParticipantService } from './participant.service';
import { AddParticipantController } from './controllers/add-participant.controller';
import { ListParticipantController } from './controllers/list-participant.controller';
import { UpdateParticipantController } from './controllers/update-participant.controller';
import { RemoveParticipantController } from './controllers/remove-participant.controller';

@Module({
  imports: [PrismaModule, ConversationModule],
  controllers: [
    AddParticipantController,
    ListParticipantController,
    UpdateParticipantController,
    RemoveParticipantController,
  ],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
