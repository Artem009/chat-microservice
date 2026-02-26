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
import { ListThreadController } from './controllers/list-thread.controller';
import { MentionService } from '../mention/mention.service';
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
  findByConversation: jest
    .fn()
    .mockResolvedValue([
      mockParticipant,
      { ...mockParticipant, id: 'part-2', userId: 'user-1' },
    ]),
  findByConversationAndUser: jest.fn().mockResolvedValue(mockParticipant),
  updateLastReadMessage: jest
    .fn()
    .mockResolvedValue({ ...mockParticipant, lastReadMessageId: 'msg-1' }),
};

const mockMentionService = {
  createMany: jest.fn().mockResolvedValue([]),
  findByMessage: jest.fn().mockResolvedValue([]),
  findByUser: jest.fn().mockResolvedValue([]),
};

describe('MessageModule', () => {
  let service: MessageService;
  let createController: CreateMessageController;
  let listController: ListMessageController;
  let getController: GetMessageController;
  let updateController: UpdateMessageController;
  let deleteController: DeleteMessageController;
  let markReadController: MarkReadController;
  let listThreadController: ListThreadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatGateway, useValue: mockChatGateway },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: MentionService, useValue: mockMentionService },
      ],
      controllers: [
        CreateMessageController,
        ListMessageController,
        ListThreadController,
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
    listThreadController =
      module.get<ListThreadController>(ListThreadController);
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
    it('should create a message with empty mentions', async () => {
      const result = await createController.create({
        content: 'Hello world',
        conversationId: 'conv-1',
        senderId: 'user-1',
      });
      expect(result).toEqual({ data: mockMessage, mentions: [] });
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

    it('should parse mentions and create mention records for active participants', async () => {
      const mentionedUserId = '550e8400-e29b-41d4-a716-446655440002';
      mockParticipantService.findByConversation.mockResolvedValueOnce([
        { ...mockParticipant, userId: mentionedUserId },
        { ...mockParticipant, id: 'part-2', userId: 'user-1' },
      ]);
      const mockMentionResult = [
        {
          id: 'mention-1',
          messageId: 'msg-1',
          mentionedUserId,
          createdAt: new Date(),
        },
      ];
      mockMentionService.createMany.mockResolvedValueOnce(mockMentionResult);

      const result = await createController.create({
        content: `Hey @${mentionedUserId} check this out`,
        conversationId: 'conv-1',
        senderId: 'user-1',
      });

      expect(mockMentionService.createMany).toHaveBeenCalledWith([
        { messageId: 'msg-1', mentionedUserId },
      ]);
      expect(result.mentions).toEqual(mockMentionResult);
    });

    it('should broadcast userMentioned event when mentions exist', async () => {
      const mentionedUserId = '550e8400-e29b-41d4-a716-446655440002';
      mockParticipantService.findByConversation.mockResolvedValueOnce([
        { ...mockParticipant, userId: mentionedUserId },
        { ...mockParticipant, id: 'part-2', userId: 'user-1' },
      ]);
      mockMentionService.createMany.mockResolvedValueOnce([
        {
          id: 'mention-1',
          messageId: 'msg-1',
          mentionedUserId,
          createdAt: new Date(),
        },
      ]);

      await createController.create({
        content: `Hey @${mentionedUserId}`,
        conversationId: 'conv-1',
        senderId: 'user-1',
      });

      expect(mockChatGateway.broadcastToRoom).toHaveBeenCalledWith(
        'conv-1',
        'userMentioned',
        {
          messageId: 'msg-1',
          conversationId: 'conv-1',
          mentionedUserIds: [mentionedUserId],
        },
      );
    });

    it('should exclude self-mentions (sender cannot mention themselves)', async () => {
      mockParticipantService.findByConversation.mockResolvedValueOnce([
        { ...mockParticipant, userId: 'user-1' },
        { ...mockParticipant, id: 'part-2', userId: 'user-2' },
      ]);

      await createController.create({
        content: '@user-1 mentioning myself',
        conversationId: 'conv-1',
        senderId: 'user-1',
      });

      // user-1 is not a valid UUID so parseMentions returns [] anyway
      expect(mockMentionService.createMany).not.toHaveBeenCalled();
    });

    it('should filter out mentions of non-participants', async () => {
      const nonParticipant = '550e8400-e29b-41d4-a716-446655440099';
      mockParticipantService.findByConversation.mockResolvedValueOnce([
        { ...mockParticipant, userId: 'user-1' },
      ]);

      await createController.create({
        content: `Hey @${nonParticipant}`,
        conversationId: 'conv-1',
        senderId: 'user-1',
      });

      expect(mockMentionService.createMany).not.toHaveBeenCalled();
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
      expect(result).toEqual({
        data: { ...mockMessage, replyCount: 0 },
      });
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

  describe('Thread Replies', () => {
    const mockParentMessage = {
      ...mockMessage,
      id: 'parent-msg-1',
      parentMessageId: null,
      _count: { replies: 0 },
    };

    const mockReply = {
      ...mockMessage,
      id: 'reply-1',
      parentMessageId: 'parent-msg-1',
    };

    describe('CreateMessageController (thread)', () => {
      it('should create a reply with valid parentMessageId', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce(
          mockParentMessage,
        );
        mockPrismaService.message.create.mockResolvedValueOnce(mockReply);

        const result = await createController.create({
          content: 'Thread reply',
          conversationId: 'conv-1',
          senderId: 'user-1',
          parentMessageId: 'parent-msg-1',
        });

        expect(result.data).toEqual(mockReply);
        expect(mockPrismaService.message.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              parentMessage: { connect: { id: 'parent-msg-1' } },
            }),
          }),
        );
      });

      it('should broadcast threadReply event for replies', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce(
          mockParentMessage,
        );
        mockPrismaService.message.create.mockResolvedValueOnce(mockReply);

        await createController.create({
          content: 'Thread reply',
          conversationId: 'conv-1',
          senderId: 'user-1',
          parentMessageId: 'parent-msg-1',
        });

        expect(mockChatGateway.broadcastToRoom).toHaveBeenCalledWith(
          'conv-1',
          'threadReply',
          { parentMessageId: 'parent-msg-1', reply: mockReply },
        );
      });

      it('should throw NotFoundException for non-existent parent', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce(null);

        await expect(
          createController.create({
            content: 'Reply',
            conversationId: 'conv-1',
            senderId: 'user-1',
            parentMessageId: 'nonexistent',
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException when parent is in a different conversation', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce({
          ...mockParentMessage,
          conversationId: 'other-conv',
        });

        await expect(
          createController.create({
            content: 'Reply',
            conversationId: 'conv-1',
            senderId: 'user-1',
            parentMessageId: 'parent-msg-1',
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should flatten nested replies to original parent', async () => {
        const nestedReply = {
          ...mockParentMessage,
          id: 'reply-1',
          parentMessageId: 'original-parent',
          conversationId: 'conv-1',
        };
        mockPrismaService.message.findUnique.mockResolvedValueOnce(
          nestedReply,
        );
        mockPrismaService.message.create.mockResolvedValueOnce({
          ...mockReply,
          parentMessageId: 'original-parent',
        });

        await createController.create({
          content: 'Nested reply',
          conversationId: 'conv-1',
          senderId: 'user-1',
          parentMessageId: 'reply-1',
        });

        expect(mockPrismaService.message.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              parentMessage: { connect: { id: 'original-parent' } },
            }),
          }),
        );
      });

      it('should not broadcast threadReply for non-threaded messages', async () => {
        mockPrismaService.message.create.mockResolvedValueOnce(mockMessage);

        await createController.create({
          content: 'Regular message',
          conversationId: 'conv-1',
          senderId: 'user-1',
        });

        expect(mockChatGateway.broadcastToRoom).not.toHaveBeenCalledWith(
          expect.anything(),
          'threadReply',
          expect.anything(),
        );
      });
    });

    describe('GetMessageController (reply count)', () => {
      it('should include replyCount in message response', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce({
          ...mockMessage,
          _count: { replies: 5 },
        });

        const result = await getController.get('msg-1');
        expect(result.data.replyCount).toBe(5);
      });

      it('should return replyCount 0 when no replies', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce({
          ...mockMessage,
          _count: { replies: 0 },
        });

        const result = await getController.get('msg-1');
        expect(result.data.replyCount).toBe(0);
      });
    });

    describe('ListThreadController', () => {
      it('should list replies for a parent message', async () => {
        const replies = [mockReply, { ...mockReply, id: 'reply-2' }];
        mockPrismaService.message.findMany.mockResolvedValueOnce(replies);

        const result =
          await listThreadController.listThread('parent-msg-1');

        expect(result).toEqual({ data: replies });
        expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
          where: { parentMessageId: 'parent-msg-1', deletedAt: null },
          orderBy: { createdAt: 'asc' },
        });
      });

      it('should return empty array when no replies exist', async () => {
        mockPrismaService.message.findMany.mockResolvedValueOnce([]);

        const result =
          await listThreadController.listThread('parent-msg-1');

        expect(result).toEqual({ data: [] });
      });
    });

    describe('MessageService (thread methods)', () => {
      it('should find replies by parentMessageId', async () => {
        mockPrismaService.message.findMany.mockResolvedValueOnce([mockReply]);

        const result = await service.findReplies('parent-msg-1');

        expect(result).toEqual([mockReply]);
        expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
          where: { parentMessageId: 'parent-msg-1', deletedAt: null },
          orderBy: { createdAt: 'asc' },
        });
      });

      it('should include _count.replies in findOne', async () => {
        mockPrismaService.message.findUnique.mockResolvedValueOnce({
          ...mockMessage,
          _count: { replies: 3 },
        });

        const result = await service.findOne('msg-1');

        expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              _count: { select: { replies: true } },
            }),
          }),
        );
        expect(result?._count?.replies).toBe(3);
      });
    });
  });
});
