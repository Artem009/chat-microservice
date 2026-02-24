import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({ data });
  }

  findAll(
    where?: Prisma.MessageWhereInput,
    pagination?: { take?: number; skip?: number },
  ) {
    return this.prisma.message.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      ...(pagination?.take && { take: pagination.take }),
      ...(pagination?.skip && { skip: pagination.skip }),
    });
  }

  findOne(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        conversation: true,
      },
    });
  }

  update(id: string, data: Prisma.MessageUpdateInput) {
    return this.prisma.message.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
