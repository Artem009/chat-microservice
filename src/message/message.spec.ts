/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat-gateway/chat.gateway';
import { ParticipantService } from '../participant/participant.service';
import { CreateMessageController } from './controllers/create-message.controller';
import { ListMessageController } from './controllers/list-message.controller';
import { GetMessageController } from './controllers/get-message.controller';
import { UpdateMessageController } from './controllers/update-message.controller';
import { DeleteMessageController } from './controllers/delete-message.controller';
import { MarkReadController } from './controllers/mark-read.controller';
import { NotFoundException } from '../exeption';

const mockMessage = {
  id: 'msg-1',
  content: 'Hello world',
  conversationId: 'conv-1',
  senderId: 'user-1',
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

const mockParticipant = {
  id: 'part-1',
  conversationId: 'conv-1',
  userId: 'user-2',
  role: 'MEMBER',
  joinedAt: new Date(),
  leftAt: null,
  lastReadMessageId: null,
};

const mockPrismaService = {
  message: {
    create: jest.fn().mockResolvedValue(mockMessage),
    findMany: jest.fn().mockResolvedValue([mockMessage]),
    findUnique: jest.fn().mockResolvedValue(mockMessage),
    update: jest.fn().mockResolvedValue(mockMessage),
    count: jest.fn().mockResolvedValue(5),
  },
  participant: {
    findUnique: jest.fn().mockResolvedValue(mockParticipant),
    update: jest
      .fn()
      .mockResolvedValue({ ...mockParticipant, lastReadMessageId: 'msg-1' }),
  },
};

const mockChatGateway = {
  broadcastToRoom: jest.fn(),
};

const mockParticipantService = {
  findByConversationAndUser: jest.fn().mockResolvedValue(mockParticipant),
  updateLastReadMessage: jest
    .fn()
    .mockResolvedValue({ ...mockParticipant, lastReadMessageId: 'msg-1' }),
};

describe('MessageModule', () => {
  let service: MessageService;
  let createController: CreateMessageController;
  let listController: ListMessageController;
  let getController: GetMessageController;
  let updateController: UpdateMessageController;
  let deleteController: DeleteMessageController;
  let markReadController: MarkReadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatGateway, useValue: mockChatGateway },
        { provide: ParticipantService, useValue: mockParticipantService },
      ],
      controllers: [
        CreateMessageController,
        ListMessageController,
        GetMessageController,
        UpdateMessageController,
        DeleteMessageController,
        MarkReadController,
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    createController = module.get<CreateMessageController>(
      CreateMessageController,
    );
    listController = module.get<ListMessageController>(ListMessageController);
    getController = module.get<GetMessageController>(GetMessageController);
    updateController = module.get<UpdateMessageController>(
      UpdateMessageController,
    );
    deleteController = module.get<DeleteMessageController>(
      DeleteMessageController,
    );
    markReadController = module.get<MarkReadController>(MarkReadController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MessageService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a message', async () => {
      const result = await service.create({
        content: 'Hello',
        senderId: 'user-1',
        conversation: { connect: { id: 'conv-1' } },
      });
      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.message.create).toHaveBeenCalled();
    });

    it('should find all messages', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockMessage]);
      expect(mockPrismaService.message.findMany).toHaveBeenCalled();
    });

    it('should find one message', async () => {
      const result = await service.findOne('msg-1');
      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'msg-1' } }),
      );
    });

    it('should update a message', async () => {
      const result = await service.update('msg-1', { content: 'Updated' });
      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.message.update).toHaveBeenCalled();
    });

    it('should soft-delete a message', async () => {
      const result = await service.remove('msg-1');
      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.message.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'msg-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('CreateMessageController', () => {
    it('should create a message', async () => {
      const result = await createController.create({
        content: 'Hello world',
        conversationId: 'conv-1',
        senderId: 'user-1',
      });
      expect(result).toEqual({ data: mockMessage });
      expect(mockPrismaService.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'Hello world',
            senderId: 'user-1',
            conversation: { connect: { id: 'conv-1' } },
          }),
        }),
      );
    });

    it('should broadcast message via WebSocket after creation', async () => {
      await createController.create({
        content: 'Hello world',
        conversationId: 'conv-1',
        senderId: 'user-1',
      });
      expect(mockChatGateway.broadcastToRoom).toHaveBeenCalledWith(
        'conv-1',
        'newMessage',
        mockMessage,
      );
    });
  });

  describe('ListMessageController', () => {
    it('should list messages by conversationId', async () => {
      const result = await listController.list('conv-1');
      expect(result).toEqual({ data: [mockMessage] });
      expect(mockPrismaService.message.findMany).toHaveBeenCalled();
    });
  });

  describe('GetMessageController', () => {
    it('should get a message by id', async () => {
      const result = await getController.get('msg-1');
      expect(result).toEqual({ data: mockMessage });
    });

    it('should throw NotFoundException when message not found', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce(null);
      await expect(getController.get('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when message is soft-deleted', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce({
        ...mockMessage,
        deletedAt: new Date(),
      });
      await expect(getController.get('msg-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateMessageController', () => {
    it('should update a message', async () => {
      const result = await updateController.update('msg-1', {
        content: 'Updated',
      });
      expect(result).toEqual({ data: mockMessage });
    });

    it('should throw NotFoundException when updating non-existent message', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce(null);
      await expect(
        updateController.update('nonexistent', { content: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteMessageController', () => {
    it('should soft-delete a message', async () => {
      const result = await deleteController.remove('msg-1');
      expect(result).toEqual({
        data: mockMessage,
        message: 'Message deleted',
      });
    });

    it('should throw NotFoundException when deleting non-existent message', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce(null);
      await expect(deleteController.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('MarkReadController', () => {
    it('should mark messages as read and return updated participant', async () => {
      const result = await markReadController.markRead({
        conversationId: 'conv-1',
        userId: 'user-2',
        lastReadMessageId: 'msg-1',
      });
      expect(result).toEqual({
        data: { ...mockParticipant, lastReadMessageId: 'msg-1' },
      });
      expect(
        mockParticipantService.findByConversationAndUser,
      ).toHaveBeenCalledWith('conv-1', 'user-2');
      expect(mockParticipantService.updateLastReadMessage).toHaveBeenCalledWith(
        'conv-1',
        'user-2',
        'msg-1',
      );
    });

    it('should broadcast readReceipt event via WebSocket', async () => {
      await markReadController.markRead({
        conversationId: 'conv-1',
        userId: 'user-2',
        lastReadMessageId: 'msg-1',
      });
      expect(mockChatGateway.broadcastToRoom).toHaveBeenCalledWith(
        'conv-1',
        'readReceipt',
        {
          conversationId: 'conv-1',
          userId: 'user-2',
          lastReadMessageId: 'msg-1',
        },
      );
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockParticipantService.findByConversationAndUser.mockResolvedValueOnce(
        null,
      );
      await expect(
        markReadController.markRead({
          conversationId: 'conv-1',
          userId: 'unknown',
          lastReadMessageId: 'msg-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when participant has left', async () => {
      mockParticipantService.findByConversationAndUser.mockResolvedValueOnce({
        ...mockParticipant,
        leftAt: new Date(),
      });
      await expect(
        markReadController.markRead({
          conversationId: 'conv-1',
          userId: 'user-2',
          lastReadMessageId: 'msg-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when message not found', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce(null);
      await expect(
        markReadController.markRead({
          conversationId: 'conv-1',
          userId: 'user-2',
          lastReadMessageId: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when message is soft-deleted', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce({
        ...mockMessage,
        deletedAt: new Date(),
      });
      await expect(
        markReadController.markRead({
          conversationId: 'conv-1',
          userId: 'user-2',
          lastReadMessageId: 'msg-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('MessageService.countUnread', () => {
    it('should count all unread messages when lastReadMessageId is null', async () => {
      const result = await service.countUnread('conv-1', 'user-2', null);
      expect(result).toBe(5);
      expect(mockPrismaService.message.count).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv-1',
          deletedAt: null,
          senderId: { not: 'user-2' },
        },
      });
    });

    it('should count unread messages after lastReadMessage', async () => {
      mockPrismaService.message.count.mockResolvedValueOnce(3);
      const result = await service.countUnread('conv-1', 'user-2', 'msg-1');
      expect(result).toBe(3);
      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id: 'msg-1' },
        select: { createdAt: true },
      });
    });

    it('should count all messages if lastReadMessage was deleted', async () => {
      mockPrismaService.message.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.message.count.mockResolvedValueOnce(10);
      const result = await service.countUnread(
        'conv-1',
        'user-2',
        'deleted-msg',
      );
      expect(result).toBe(10);
    });
  });
});
