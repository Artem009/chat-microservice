import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createTestApp,
  MockPrismaService,
  parseBody,
  parseListBody,
} from './helpers/e2e-setup';

describe('Message (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: MockPrismaService;

  const conversationId = '550e8400-e29b-41d4-a716-446655440001';
  const senderId = '550e8400-e29b-41d4-a716-446655440010';

  const mockMessage = {
    id: '550e8400-e29b-41d4-a716-446655440020',
    content: 'Hello world',
    conversationId,
    senderId,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  const mockParticipant = {
    id: '550e8400-e29b-41d4-a716-446655440030',
    conversationId,
    userId: senderId,
    role: 'MEMBER',
    joinedAt: new Date('2026-01-01'),
    leftAt: null,
    lastReadMessageId: null,
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

  describe('POST /api/message', () => {
    it('should create a message and return 201', async () => {
      prisma.message.create.mockResolvedValue(mockMessage);

      const response = await app.inject({
        method: 'POST',
        url: '/api/message',
        payload: {
          content: 'Hello world',
          conversationId,
          senderId,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(mockMessage.id);
      expect(body.data.content).toBe('Hello world');
    });

    it('should return 400 when content is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/message',
        payload: {
          conversationId,
          senderId,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when conversationId is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/message',
        payload: {
          content: 'Hello',
          senderId,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/message', () => {
    it('should list messages for a conversation', async () => {
      prisma.message.findMany.mockResolvedValue([mockMessage]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/message?conversationId=${conversationId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it('should support pagination parameters', async () => {
      prisma.message.findMany.mockResolvedValue([mockMessage]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/message?conversationId=${conversationId}&take=10&skip=0`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
    });
  });

  describe('GET /api/message/:id', () => {
    it('should return a single message with conversation', async () => {
      prisma.message.findUnique.mockResolvedValue({
        ...mockMessage,
        conversation: { id: conversationId, title: 'Test' },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/message/${mockMessage.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(mockMessage.id);
    });

    it('should return 404 when not found', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/message/550e8400-e29b-41d4-a716-446655440099',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/message/:id', () => {
    it('should update a message', async () => {
      const updated = { ...mockMessage, content: 'Updated content' };
      prisma.message.findUnique.mockResolvedValue({
        ...mockMessage,
        conversation: { id: conversationId },
      });
      prisma.message.update.mockResolvedValue(updated);

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/message/${mockMessage.id}`,
        payload: { content: 'Updated content' },
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.content).toBe('Updated content');
    });

    it('should return 404 when updating non-existent message', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/message/550e8400-e29b-41d4-a716-446655440099',
        payload: { content: 'Updated' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/message/:id', () => {
    it('should soft-delete a message', async () => {
      const deleted = { ...mockMessage, deletedAt: new Date() };
      prisma.message.findUnique.mockResolvedValue({
        ...mockMessage,
        conversation: { id: conversationId },
      });
      prisma.message.update.mockResolvedValue(deleted);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/message/${mockMessage.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.message).toBe('Message deleted');
    });

    it('should return 404 when deleting non-existent message', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/message/550e8400-e29b-41d4-a716-446655440099',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/message/thread/:parentMessageId', () => {
    it('should list thread replies for a parent message', async () => {
      const mockReply = {
        ...mockMessage,
        id: '550e8400-e29b-41d4-a716-446655440021',
        parentMessageId: mockMessage.id,
      };
      prisma.message.findMany.mockResolvedValue([mockReply]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/message/thread/${mockMessage.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it('should return empty array when no replies exist', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/message/thread/${mockMessage.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toEqual([]);
    });
  });

  describe('POST /api/message/read (Mark Read)', () => {
    it('should mark messages as read and return participant', async () => {
      prisma.participant.findUnique.mockResolvedValue(mockParticipant);
      prisma.message.findUnique.mockResolvedValue({
        ...mockMessage,
        conversation: { id: conversationId },
      });
      prisma.participant.update.mockResolvedValue({
        ...mockParticipant,
        lastReadMessageId: mockMessage.id,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/message/read',
        payload: {
          conversationId,
          userId: senderId,
          lastReadMessageId: mockMessage.id,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.lastReadMessageId).toBe(mockMessage.id);
    });

    it('should return 404 when participant not found', async () => {
      prisma.participant.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/api/message/read',
        payload: {
          conversationId,
          userId: '550e8400-e29b-41d4-a716-446655440099',
          lastReadMessageId: mockMessage.id,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/message/read',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
