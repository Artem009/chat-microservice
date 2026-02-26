import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MentionService {
  constructor(private readonly prisma: PrismaService) {}

  createMany(data: { messageId: string; mentionedUserId: string }[]) {
    return this.prisma.mention.createManyAndReturn({ data });
  }

  findByMessage(messageId: string) {
    return this.prisma.mention.findMany({
      where: { messageId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(mentionedUserId: string) {
    return this.prisma.mention.findMany({
      where: { mentionedUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(where?: Prisma.MentionWhereInput) {
    return this.prisma.mention.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
