import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createTestApp,
  MockPrismaService,
  parseBody,
  parseListBody,
} from './helpers/e2e-setup';

describe('Conversation (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: MockPrismaService;

  const mockConversation = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Conversation',
    type: 'GROUP',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    participants: [],
  };

  const userId = '550e8400-e29b-41d4-a716-446655440010';

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/conversation', () => {
    it('should create a conversation and return 201', async () => {
      prisma.conversation.create.mockResolvedValue(mockConversation);

      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation',
        payload: {
          title: 'Test Conversation',
          type: 'GROUP',
          participantIds: ['550e8400-e29b-41d4-a716-446655440011'],
          currentUserId: userId,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(mockConversation.id);
    });

    it('should return 400 when body is empty', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when participantIds is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation',
        payload: {
          title: 'Test',
          currentUserId: userId,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for extra fields (forbidNonWhitelisted)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/conversation',
        payload: {
          title: 'Test',
          participantIds: ['550e8400-e29b-41d4-a716-446655440011'],
          currentUserId: userId,
          extraField: 'should-be-rejected',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/conversation', () => {
    it('should list conversations with unread count', async () => {
      prisma.conversation.findMany.mockResolvedValue([
        {
          ...mockConversation,
          participants: [{ userId, lastReadMessageId: null }],
        },
      ]);
      prisma.message.count.mockResolvedValue(0);

      const response = await app.inject({
        method: 'GET',
        url: `/api/conversation?currentUserId=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/conversation/:id', () => {
    it('should return a single conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...mockConversation,
        messages: [],
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/conversation/${mockConversation.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(mockConversation.id);
    });

    it('should return 404 when not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/conversation/550e8400-e29b-41d4-a716-446655440099',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when soft-deleted', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...mockConversation,
        deletedAt: new Date(),
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/conversation/${mockConversation.id}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/conversation/:id', () => {
    it('should update a conversation', async () => {
      const updated = { ...mockConversation, title: 'Updated Title' };
      prisma.conversation.findUnique.mockResolvedValue({
        ...mockConversation,
        messages: [],
      });
      prisma.conversation.update.mockResolvedValue(updated);

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/conversation/${mockConversation.id}`,
        payload: { title: 'Updated Title' },
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.title).toBe('Updated Title');
    });

    it('should return 404 when updating non-existent conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/conversation/550e8400-e29b-41d4-a716-446655440099',
        payload: { title: 'Updated' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/conversation/:id', () => {
    it('should soft-delete a conversation', async () => {
      const deleted = { ...mockConversation, deletedAt: new Date() };
      prisma.conversation.findUnique.mockResolvedValue({
        ...mockConversation,
        messages: [],
      });
      prisma.conversation.update.mockResolvedValue(deleted);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/conversation/${mockConversation.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.message).toBe('Conversation deleted');
    });

    it('should return 404 when deleting non-existent conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/conversation/550e8400-e29b-41d4-a716-446655440099',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
