import { Test, TestingModule } from '@nestjs/testing';
import { MentionService } from './mention.service';
import { PrismaService } from '../prisma/prisma.service';
import { ListMentionController } from './controllers/list-mention.controller';
import { parseMentions } from './mention-parser';

const mockMention = {
  id: 'mention-1',
  messageId: 'msg-1',
  mentionedUserId: '550e8400-e29b-41d4-a716-446655440001',
  createdAt: new Date(),
};

const mockPrismaService = {
  mention: {
    createManyAndReturn: jest.fn().mockResolvedValue([mockMention]),
    findMany: jest.fn().mockResolvedValue([mockMention]),
  },
};

describe('MentionModule', () => {
  let service: MentionService;
  let listController: ListMentionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
      controllers: [ListMentionController],
    }).compile();

    service = module.get<MentionService>(MentionService);
    listController = module.get<ListMentionController>(ListMentionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseMentions', () => {
    it('should extract a single @uuid mention', () => {
      const result = parseMentions(
        'Hello @550e8400-e29b-41d4-a716-446655440001!',
      );
      expect(result).toEqual(['550e8400-e29b-41d4-a716-446655440001']);
    });

    it('should extract multiple unique mentions', () => {
      const result = parseMentions(
        'Hey @550e8400-e29b-41d4-a716-446655440001 and @660e8400-e29b-41d4-a716-446655440002',
      );
      expect(result).toHaveLength(2);
      expect(result).toContain('550e8400-e29b-41d4-a716-446655440001');
      expect(result).toContain('660e8400-e29b-41d4-a716-446655440002');
    });

    it('should deduplicate repeated mentions', () => {
      const result = parseMentions(
        '@550e8400-e29b-41d4-a716-446655440001 again @550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result).toEqual(['550e8400-e29b-41d4-a716-446655440001']);
    });

    it('should return empty array when no mentions', () => {
      const result = parseMentions('Hello world, no mentions here');
      expect(result).toEqual([]);
    });

    it('should not match invalid uuid patterns', () => {
      const result = parseMentions('@not-a-uuid and @12345');
      expect(result).toEqual([]);
    });

    it('should be case-insensitive and normalize to lowercase', () => {
      const result = parseMentions('@550E8400-E29B-41D4-A716-446655440001');
      expect(result).toEqual(['550e8400-e29b-41d4-a716-446655440001']);
    });
  });

  describe('MentionService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create mentions in bulk', async () => {
      const result = await service.createMany([
        {
          messageId: 'msg-1',
          mentionedUserId: '550e8400-e29b-41d4-a716-446655440001',
        },
      ]);
      expect(result).toEqual([mockMention]);
      expect(mockPrismaService.mention.createManyAndReturn).toHaveBeenCalled();
    });

    it('should find mentions by messageId', async () => {
      const result = await service.findByMessage('msg-1');
      expect(result).toEqual([mockMention]);
      expect(mockPrismaService.mention.findMany).toHaveBeenCalledWith({
        where: { messageId: 'msg-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find mentions by userId', async () => {
      const result = await service.findByUser(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result).toEqual([mockMention]);
      expect(mockPrismaService.mention.findMany).toHaveBeenCalledWith({
        where: { mentionedUserId: '550e8400-e29b-41d4-a716-446655440001' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('ListMentionController', () => {
    it('should list mentions by messageId', async () => {
      const result = await listController.list('msg-1', undefined);
      expect(result).toEqual({ data: [mockMention] });
    });

    it('should list mentions by userId', async () => {
      const result = await listController.list(
        undefined,
        '550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result).toEqual({ data: [mockMention] });
    });

    it('should return empty array when no query params', async () => {
      const result = await listController.list(undefined, undefined);
      expect(result).toEqual({ data: [] });
    });
  });
});
