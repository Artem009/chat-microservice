import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReactionService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ReactionCreateInput) {
    return this.prisma.reaction.create({ data });
  }

  findAll(where?: Prisma.ReactionWhereInput) {
    return this.prisma.reaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.reaction.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.reaction.delete({ where: { id } });
  }
}
