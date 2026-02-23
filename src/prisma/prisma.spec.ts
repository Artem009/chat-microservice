import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect(service).toHaveProperty('onModuleInit');
  });

  it('should have onModuleDestroy method', () => {
    expect(service).toHaveProperty('onModuleDestroy');
  });
});

describe('PrismaModule', () => {
  it('should provide PrismaService', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
    expect(service).toHaveProperty('$connect');
    expect(service).toHaveProperty('$disconnect');
  });
});
