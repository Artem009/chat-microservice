import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createTestApp,
  MockPrismaService,
  parseBody,
  parseListBody,
} from './helpers/e2e-setup';

describe('Participant (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: MockPrismaService;

  const conversationId = '550e8400-e29b-41d4-a716-446655440001';
  const userId = '550e8400-e29b-41d4-a716-446655440010';

  const mockParticipant = {
    id: '550e8400-e29b-41d4-a716-446655440030',
    conversationId,
    userId,
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

  describe('POST /api/participant', () => {
    it('should add a participant and return 201', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: conversationId,
        title: 'Test',
        type: 'GROUP',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      prisma.participant.findUnique.mockResolvedValue(null);
      prisma.participant.create.mockResolvedValue(mockParticipant);

      const response = await app.inject({
        method: 'POST',
        url: '/api/participant',
        payload: {
          conversationId,
          userId,
          role: 'MEMBER',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.userId).toBe(userId);
      expect(body.data.role).toBe('MEMBER');
    });

    it('should re-add a previously left participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: conversationId,
        title: 'Test',
        type: 'GROUP',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      const leftParticipant = { ...mockParticipant, leftAt: new Date() };
      prisma.participant.findUnique.mockResolvedValue(leftParticipant);
      prisma.participant.update.mockResolvedValue(mockParticipant);

      const response = await app.inject({
        method: 'POST',
        url: '/api/participant',
        payload: {
          conversationId,
          userId,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
    });

    it('should return 409 when user is already an active participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: conversationId,
        title: 'Test',
        type: 'GROUP',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      prisma.participant.findUnique.mockResolvedValue(mockParticipant);

      const response = await app.inject({
        method: 'POST',
        url: '/api/participant',
        payload: {
          conversationId,
          userId,
        },
      });

      expect(response.statusCode).toBe(409);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/participant',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 with invalid role', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/participant',
        payload: {
          conversationId,
          userId,
          role: 'INVALID_ROLE',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/participant', () => {
    it('should list active participants for a conversation', async () => {
      prisma.participant.findMany.mockResolvedValue([mockParticipant]);

      const response = await app.inject({
        method: 'GET',
        url: `/api/participant?conversationId=${conversationId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseListBody(response);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
    });
  });

  describe('PATCH /api/participant/:id', () => {
    it('should update participant role', async () => {
      const updated = { ...mockParticipant, role: 'ADMIN' };
      prisma.participant.findUnique.mockResolvedValue(mockParticipant);
      prisma.participant.update.mockResolvedValue(updated);

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/participant/${mockParticipant.id}`,
        payload: { role: 'ADMIN' },
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.data.role).toBe('ADMIN');
    });

    it('should return 404 when participant not found', async () => {
      prisma.participant.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/participant/550e8400-e29b-41d4-a716-446655440099',
        payload: { role: 'ADMIN' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when participant has left', async () => {
      prisma.participant.findUnique.mockResolvedValue({
        ...mockParticipant,
        leftAt: new Date(),
      });

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/participant/${mockParticipant.id}`,
        payload: { role: 'ADMIN' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/participant/:id', () => {
    it('should soft-remove a participant', async () => {
      const removed = { ...mockParticipant, leftAt: new Date() };
      prisma.participant.findUnique.mockResolvedValue(mockParticipant);
      prisma.participant.update.mockResolvedValue(removed);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/participant/${mockParticipant.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = parseBody(response);
      expect(body.data).toBeDefined();
      expect(body.message).toBe('Participant removed');
    });

    it('should return 404 when removing non-existent participant', async () => {
      prisma.participant.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/participant/550e8400-e29b-41d4-a716-446655440099',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
