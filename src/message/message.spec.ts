/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat-gateway/chat.gateway';
import { CreateMessageController } from './controllers/create-message.controller';
import { ListMessageController } from './controllers/list-message.controller';
import { GetMessageController } from './controllers/get-message.controller';
import { UpdateMessageController } from './controllers/update-message.controller';
import { DeleteMessageController } from './controllers/delete-message.controller';
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

const mockPrismaService = {
  message: {
    create: jest.fn().mockResolvedValue(mockMessage),
    findMany: jest.fn().mockResolvedValue([mockMessage]),
    findUnique: jest.fn().mockResolvedValue(mockMessage),
    update: jest.fn().mockResolvedValue(mockMessage),
  },
};

const mockChatGateway = {
  broadcastToRoom: jest.fn(),
};

describe('MessageModule', () => {
  let service: MessageService;
  let createController: CreateMessageController;
  let listController: ListMessageController;
  let getController: GetMessageController;
  let updateController: UpdateMessageController;
  let deleteController: DeleteMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
      controllers: [
        CreateMessageController,
        ListMessageController,
        GetMessageController,
        UpdateMessageController,
        DeleteMessageController,
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
});
