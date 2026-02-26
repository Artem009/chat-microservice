import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createTestApp,
  MockPrismaService,
  parseListBody,
} from './helpers/e2e-setup';

describe('Mention (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: MockPrismaService;

  const messageId = '550e8400-e29b-41d4-a716-446655440020';
  const userId = '550e8400-e29b-41d4-a716-446655440010';

  const mockMention = {
    id: '550e8400-e29b-41d4-a716-446655440050',
    messageId,
    mentionedUserId: userId,
    createdAt: new Date('2026-01-01'),
  };

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/mention', () => {
    it('should list mentions by messageId', async () => {
      prisma.mention.findMany.mockResolvedValue([mockMention]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/mention?messageId=${messageId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it('should list mentions by userId', async () => {
      prisma.mention.findMany.mockResolvedValue([mockMention]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/mention?userId=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return empty array when no params provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mention',
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toEqual([]);
    });
  });
});
