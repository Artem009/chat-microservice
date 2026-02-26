import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createTestApp,
  MockPrismaService,
  parseBody,
  parseListBody,
} from './helpers/e2e-setup';

describe('Reaction (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: MockPrismaService;

  const messageId = '550e8400-e29b-41d4-a716-446655440020';
  const userId = '550e8400-e29b-41d4-a716-446655440010';
  const conversationId = '550e8400-e29b-41d4-a716-446655440001';

  const mockReaction = {
    id: '550e8400-e29b-41d4-a716-446655440040',
    messageId,
    userId,
    emoji: 'thumbs_up',
    createdAt: new Date('2026-01-01'),
  };

  const mockMessage = {
    id: messageId,
    content: 'Hello',
    conversationId,
    senderId: userId,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    conversation: { id: conversationId },
    _count: { replies: 0 },
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

  describe('POST /api/reaction', () => {
    it('should create a reaction and return 201', async () => {
      prisma.message.findUnique.mockResolvedValue(mockMessage);
      prisma.reaction.create.mockResolvedValue(mockReaction);

      const response = await app.inject({
        method: 'POST',
        url: '/api/reaction',
        payload: { messageId, userId, emoji: 'thumbs_up' },
      });

      expect(response.statusCode).toBe(201);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.emoji).toBe('thumbs_up');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/reaction',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 404 when message not found', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/api/reaction',
        payload: { messageId, userId, emoji: 'heart' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 409 when duplicate reaction', async () => {
      prisma.message.findUnique.mockResolvedValue(mockMessage);
      const p2002Error = new Error('Unique constraint failed');
      Object.assign(p2002Error, { code: 'P2002' });
      prisma.reaction.create.mockRejectedValue(p2002Error);

      const response = await app.inject({
        method: 'POST',
        url: '/api/reaction',
        payload: { messageId, userId, emoji: 'thumbs_up' },
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('GET /api/reaction', () => {
    it('should list reactions for a message', async () => {
      prisma.reaction.findMany.mockResolvedValue([mockReaction]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/reaction?messageId=${messageId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
    });
  });

  describe('DELETE /api/reaction/:id', () => {
    it('should delete a reaction and return 200', async () => {
      prisma.reaction.findUnique.mockResolvedValue(mockReaction);
      prisma.reaction.delete.mockResolvedValue(mockReaction);
      prisma.message.findUnique.mockResolvedValue(mockMessage);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/reaction/${mockReaction.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.message).toBe('Reaction removed');
    });

    it('should return 404 when reaction not found', async () => {
      prisma.reaction.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/reaction/550e8400-e29b-41d4-a716-446655440099',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
