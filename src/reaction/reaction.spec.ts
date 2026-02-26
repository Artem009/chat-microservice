import { Test, TestingModule } from '@nestjs/testing';
import { ReactionService } from './reaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat-gateway/chat.gateway';
import { MessageService } from '../message/message.service';
import { CreateReactionController } from './controllers/create-reaction.controller';
import { DeleteReactionController } from './controllers/delete-reaction.controller';
import { ListReactionController } from './controllers/list-reaction.controller';
import { NotFoundException, ConflictException } from '../exeption';

const mockReaction = {
  id: 'reaction-1',
  messageId: 'msg-1',
  userId: 'user-1',
  emoji: 'thumbs_up',
  createdAt: new Date(),
};

const mockMessage = {
  id: 'msg-1',
  content: 'Hello world',
  conversationId: 'conv-1',
  senderId: 'user-2',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  conversation: {
    id: 'conv-1',
    title: 'Test Chat',
    type: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
};

const mockPrismaService = {
  reaction: {
    create: jest.fn().mockResolvedValue(mockReaction),
    findMany: jest.fn().mockResolvedValue([mockReaction]),
    findUnique: jest.fn().mockResolvedValue(mockReaction),
    delete: jest.fn().mockResolvedValue(mockReaction),
  },
  message: {
    findUnique: jest.fn().mockResolvedValue(mockMessage),
  },
};

const mockChatGateway = {
  broadcastToRoom: jest.fn(),
};

describe('ReactionModule', () => {
  let service: ReactionService;
  let createController: CreateReactionController;
  let deleteController: DeleteReactionController;
  let listController: ListReactionController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionService,
        MessageService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
      controllers: [
        CreateReactionController,
        DeleteReactionController,
        ListReactionController,
      ],
    }).compile();

    service = module.get<ReactionService>(ReactionService);
    createController = module.get<CreateReactionController>(
      CreateReactionController,
    );
    deleteController = module.get<DeleteReactionController>(
      DeleteReactionController,
    );
    listController = module.get<ListReactionController>(ListReactionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ReactionService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a reaction', async () => {
      const result = await service.create({
        emoji: 'thumbs_up',
        userId: 'user-1',
        message: { connect: { id: 'msg-1' } },
      });
      expect(result).toEqual(mockReaction);
      expect(mockPrismaService.reaction.create).toHaveBeenCalled();
    });

    it('should find all reactions', async () => {
      const result = await service.findAll({ messageId: 'msg-1' });
      expect(result).toEqual([mockReaction]);
      expect(mockPrismaService.reaction.findMany).toHaveBeenCalled();
    });

    it('should find one reaction', async () => {
      const result = await service.findOne('reaction-1');
      expect(result).toEqual(mockReaction);
      expect(mockPrismaService.reaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'reaction-1' },
      });
    });

    it('should delete a reaction', async () => {
      const result = await service.remove('reaction-1');
      expect(result).toEqual(mockReaction);
      expect(mockPrismaService.reaction.delete).toHaveBeenCalledWith({
        where: { id: 'reaction-1' },
      });
    });
  });

  describe('CreateReactionController', () => {
    it('should create a reaction and return data envelope', async () => {
      const result = await createController.create({
        messageId: 'msg-1',
        userId: 'user-1',
        emoji: 'thumbs_up',
      });
      expect(result).toEqual({ data: mockReaction });
      expect(mockPrismaService.reaction.create).toHaveBeenCalled();
    });

    it('should broadcast reactionAdded event via WebSocket', async () => {
      await createController.create({
        messageId: 'msg-1',
        userId: 'user-1',
        emoji: 'thumbs_up',
      });
      expect(mockChatGateway.broadcastToRoom).toHaveBeenCalledWith(
        'conv-1',
        'reactionAdded',
        {
          messageId: 'msg-1',
          userId: 'user-1',
          emoji: 'thumbs_up',
          type: 'added',
        },
      );
    });

    it('should throw NotFoundException when message not found', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce(null);
      await expect(
        createController.create({
          messageId: 'nonexistent',
          userId: 'user-1',
          emoji: 'thumbs_up',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when message is soft-deleted', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce({
        ...mockMessage,
        deletedAt: new Date(),
      });
      await expect(
        createController.create({
          messageId: 'msg-1',
          userId: 'user-1',
          emoji: 'thumbs_up',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate reaction', async () => {
      const prismaError = new Error('Unique constraint failed');
      Object.assign(prismaError, { code: 'P2002' });
      mockPrismaService.reaction.create.mockRejectedValueOnce(prismaError);
      await expect(
        createController.create({
          messageId: 'msg-1',
          userId: 'user-1',
          emoji: 'thumbs_up',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('DeleteReactionController', () => {
    it('should delete a reaction and return data envelope', async () => {
      const result = await deleteController.remove('reaction-1');
      expect(result).toEqual({
        data: mockReaction,
        message: 'Reaction removed',
      });
    });

    it('should broadcast reactionRemoved event via WebSocket', async () => {
      await deleteController.remove('reaction-1');
      expect(mockChatGateway.broadcastToRoom).toHaveBeenCalledWith(
        'conv-1',
        'reactionRemoved',
        {
          messageId: 'msg-1',
          userId: 'user-1',
          emoji: 'thumbs_up',
          type: 'removed',
        },
      );
    });

    it('should throw NotFoundException when reaction not found', async () => {
      mockPrismaService.reaction.findUnique.mockResolvedValueOnce(null);
      await expect(deleteController.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('ListReactionController', () => {
    it('should list reactions by messageId', async () => {
      const result = await listController.list('msg-1');
      expect(result).toEqual({ data: [mockReaction] });
      expect(mockPrismaService.reaction.findMany).toHaveBeenCalled();
    });
  });
});
