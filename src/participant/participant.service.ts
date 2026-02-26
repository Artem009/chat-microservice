import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParticipantService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ParticipantCreateInput) {
    return this.prisma.participant.create({ data });
  }

  findByConversation(conversationId: string) {
    return this.prisma.participant.findMany({
      where: { conversationId, leftAt: null },
      orderBy: { joinedAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.participant.findUnique({
      where: { id },
      include: { conversation: true },
    });
  }

  findByConversationAndUser(conversationId: string, userId: string) {
    return this.prisma.participant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
  }

  update(id: string, data: Prisma.ParticipantUpdateInput) {
    return this.prisma.participant.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.participant.update({
      where: { id },
      data: { leftAt: new Date() },
    });
  }

  updateLastReadMessage(
    conversationId: string,
    userId: string,
    lastReadMessageId: string,
  ) {
    return this.prisma.participant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadMessageId },
    });
  }
}
