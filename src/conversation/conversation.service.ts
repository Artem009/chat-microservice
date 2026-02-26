import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ConversationCreateInput) {
    return this.prisma.conversation.create({ data });
  }

  findAll(where?: Prisma.ConversationWhereInput) {
    return this.prisma.conversation.findMany({
      where: { ...where, deletedAt: null },
      include: { participants: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  update(id: string, data: Prisma.ConversationUpdateInput) {
    return this.prisma.conversation.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllWithUnreadCount(userId: string) {
    const conversations = await this.findAll({
      participants: { some: { userId, leftAt: null } },
    });

    return Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(
          (p) => p.userId === userId && !p.leftAt,
        );

        let unreadCount = 0;

        if (participant) {
          const where: Prisma.MessageWhereInput = {
            conversationId: conv.id,
            deletedAt: null,
            senderId: { not: userId },
          };

          if (participant.lastReadMessageId) {
            const lastReadMessage = await this.prisma.message.findUnique({
              where: { id: participant.lastReadMessageId },
              select: { createdAt: true },
            });

            if (lastReadMessage) {
              where.createdAt = { gt: lastReadMessage.createdAt };
            }
          }

          unreadCount = await this.prisma.message.count({ where });
        }

        return { ...conv, unreadCount };
      }),
    );
  }
}
