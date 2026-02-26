/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationController } from './controllers/create-conversation.controller';
import { ListConversationController } from './controllers/list-conversation.controller';
import { GetConversationController } from './controllers/get-conversation.controller';
import { UpdateConversationController } from './controllers/update-conversation.controller';
import { DeleteConversationController } from './controllers/delete-conversation.controller';
import { NotFoundException } from '../exeption';

const mockConversation = {
  id: 'conv-1',
  title: 'Test Chat',
  type: 'GROUP',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  participants: [
    {
      id: 'p-1',
      conversationId: 'conv-1',
      userId: 'user-1',
      role: 'ADMIN',
      joinedAt: new Date(),
      leftAt: null,
      lastReadMessageId: null,
    },
  ],
  messages: [],
};

const mockPrismaService = {
  conversation: {
    create: jest.fn().mockResolvedValue(mockConversation),
    findMany: jest.fn().mockResolvedValue([mockConversation]),
    findUnique: jest.fn().mockResolvedValue(mockConversation),
    update: jest.fn().mockResolvedValue(mockConversation),
  },
  message: {
    count: jest.fn().mockResolvedValue(3),
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

describe('ConversationModule', () => {
  let service: ConversationService;
  let createController: CreateConversationController;
  let listController: ListConversationController;
  let getController: GetConversationController;
  let updateController: UpdateConversationController;
  let deleteController: DeleteConversationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
      controllers: [
        CreateConversationController,
        ListConversationController,
        GetConversationController,
        UpdateConversationController,
        DeleteConversationController,
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    createController = module.get<CreateConversationController>(
      CreateConversationController,
    );
    listController = module.get<ListConversationController>(
      ListConversationController,
    );
    getController = module.get<GetConversationController>(
      GetConversationController,
    );
    updateController = module.get<UpdateConversationController>(
      UpdateConversationController,
    );
    deleteController = module.get<DeleteConversationController>(
      DeleteConversationController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ConversationService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a conversation', async () => {
      const result = await service.create({ title: 'Test', type: 'GROUP' });
      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.create).toHaveBeenCalled();
    });

    it('should find all conversations', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockConversation]);
      expect(mockPrismaService.conversation.findMany).toHaveBeenCalled();
    });

    it('should find one conversation', async () => {
      const result = await service.findOne('conv-1');
      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'conv-1' } }),
      );
    });

    it('should update a conversation', async () => {
      const result = await service.update('conv-1', { title: 'Updated' });
      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.update).toHaveBeenCalled();
    });

    it('should soft-delete a conversation', async () => {
      const result = await service.remove('conv-1');
      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('CreateConversationController', () => {
    it('should create a conversation with participants', async () => {
      const result = await createController.create({
        title: 'Test Chat',
        participantIds: ['user-2', 'user-3'],
        currentUserId: 'user-1',
      });
      expect(result).toEqual({ data: mockConversation });
      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Chat',
            participants: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ userId: 'user-1', role: 'ADMIN' }),
              ]),
            }),
          }),
        }),
      );
    });
  });

  describe('ListConversationController', () => {
    it('should list conversations for a user with unreadCount', async () => {
      const result = await listController.list('user-1');
      expect(result).toEqual({
        data: [{ ...mockConversation, unreadCount: 3 }],
      });
      expect(mockPrismaService.conversation.findMany).toHaveBeenCalled();
      expect(mockPrismaService.message.count).toHaveBeenCalled();
    });
  });

  describe('GetConversationController', () => {
    it('should get a conversation by id', async () => {
      const result = await getController.get('conv-1');
      expect(result).toEqual({ data: mockConversation });
    });

    it('should throw NotFoundException when conversation not found', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValueOnce(null);
      await expect(getController.get('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when conversation is soft-deleted', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValueOnce({
        ...mockConversation,
        deletedAt: new Date(),
      });
      await expect(getController.get('conv-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateConversationController', () => {
    it('should update a conversation', async () => {
      const result = await updateController.update('conv-1', {
        title: 'Updated',
      });
      expect(result).toEqual({ data: mockConversation });
    });

    it('should throw NotFoundException when updating non-existent conversation', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValueOnce(null);
      await expect(
        updateController.update('nonexistent', { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteConversationController', () => {
    it('should soft-delete a conversation', async () => {
      const result = await deleteController.remove('conv-1');
      expect(result).toEqual({
        data: mockConversation,
        message: 'Conversation deleted',
      });
    });

    it('should throw NotFoundException when deleting non-existent conversation', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValueOnce(null);
      await expect(deleteController.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
