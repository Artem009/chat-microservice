/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantService } from './participant.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationService } from '../conversation/conversation.service';
import { AddParticipantController } from './controllers/add-participant.controller';
import { ListParticipantController } from './controllers/list-participant.controller';
import { UpdateParticipantController } from './controllers/update-participant.controller';
import { RemoveParticipantController } from './controllers/remove-participant.controller';
import { ConflictException, NotFoundException } from '../exeption';

const mockConversation = {
  id: 'conv-1',
  title: 'Test Chat',
  type: 'GROUP',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  participants: [],
  messages: [],
};

const mockParticipant = {
  id: 'part-1',
  conversationId: 'conv-1',
  userId: 'user-1',
  role: 'MEMBER',
  joinedAt: new Date(),
  leftAt: null,
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
  participant: {
    create: jest.fn().mockResolvedValue(mockParticipant),
    findMany: jest.fn().mockResolvedValue([mockParticipant]),
    findUnique: jest.fn().mockResolvedValue(mockParticipant),
    update: jest.fn().mockResolvedValue(mockParticipant),
  },
};

const mockConversationService = {
  findOne: jest.fn().mockResolvedValue(mockConversation),
};

describe('ParticipantModule', () => {
  let service: ParticipantService;
  let addController: AddParticipantController;
  let listController: ListParticipantController;
  let updateController: UpdateParticipantController;
  let removeController: RemoveParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConversationService, useValue: mockConversationService },
      ],
      controllers: [
        AddParticipantController,
        ListParticipantController,
        UpdateParticipantController,
        RemoveParticipantController,
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
    addController = module.get<AddParticipantController>(
      AddParticipantController,
    );
    listController = module.get<ListParticipantController>(
      ListParticipantController,
    );
    updateController = module.get<UpdateParticipantController>(
      UpdateParticipantController,
    );
    removeController = module.get<RemoveParticipantController>(
      RemoveParticipantController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ParticipantService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a participant', async () => {
      const result = await service.create({
        userId: 'user-1',
        role: 'MEMBER',
        conversation: { connect: { id: 'conv-1' } },
      });
      expect(result).toEqual(mockParticipant);
      expect(mockPrismaService.participant.create).toHaveBeenCalled();
    });

    it('should find participants by conversation', async () => {
      const result = await service.findByConversation('conv-1');
      expect(result).toEqual([mockParticipant]);
      expect(mockPrismaService.participant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversationId: 'conv-1', leftAt: null },
        }),
      );
    });

    it('should find one participant', async () => {
      const result = await service.findOne('part-1');
      expect(result).toEqual(mockParticipant);
      expect(mockPrismaService.participant.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'part-1' } }),
      );
    });

    it('should find by conversation and user', async () => {
      const result = await service.findByConversationAndUser(
        'conv-1',
        'user-1',
      );
      expect(result).toEqual(mockParticipant);
      expect(mockPrismaService.participant.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            conversationId_userId: {
              conversationId: 'conv-1',
              userId: 'user-1',
            },
          },
        }),
      );
    });

    it('should update a participant', async () => {
      const result = await service.update('part-1', { role: 'ADMIN' });
      expect(result).toEqual(mockParticipant);
      expect(mockPrismaService.participant.update).toHaveBeenCalled();
    });

    it('should soft-remove a participant', async () => {
      const result = await service.remove('part-1');
      expect(result).toEqual(mockParticipant);
      expect(mockPrismaService.participant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'part-1' },
          data: expect.objectContaining({ leftAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('AddParticipantController', () => {
    it('should add a new participant', async () => {
      mockConversationService.findOne.mockResolvedValueOnce(mockConversation);
      mockPrismaService.participant.findUnique.mockResolvedValueOnce(null);
      const result = await addController.add({
        conversationId: 'conv-1',
        userId: 'user-2',
      });
      expect(result).toEqual({ data: mockParticipant });
      expect(mockPrismaService.participant.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for active duplicate', async () => {
      mockConversationService.findOne.mockResolvedValueOnce(mockConversation);
      mockPrismaService.participant.findUnique.mockResolvedValueOnce(
        mockParticipant,
      );
      await expect(
        addController.add({
          conversationId: 'conv-1',
          userId: 'user-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rejoin a participant who left', async () => {
      mockConversationService.findOne.mockResolvedValueOnce(mockConversation);
      mockPrismaService.participant.findUnique.mockResolvedValueOnce({
        ...mockParticipant,
        leftAt: new Date(),
      });
      const result = await addController.add({
        conversationId: 'conv-1',
        userId: 'user-1',
      });
      expect(result).toEqual({ data: mockParticipant });
      expect(mockPrismaService.participant.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when conversation not found', async () => {
      mockConversationService.findOne.mockResolvedValueOnce(null);
      await expect(
        addController.add({
          conversationId: 'nonexistent',
          userId: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when conversation is soft-deleted', async () => {
      mockConversationService.findOne.mockResolvedValueOnce({
        ...mockConversation,
        deletedAt: new Date(),
      });
      await expect(
        addController.add({
          conversationId: 'conv-1',
          userId: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListParticipantController', () => {
    it('should list participants by conversationId', async () => {
      const result = await listController.list('conv-1');
      expect(result).toEqual({ data: [mockParticipant] });
      expect(mockPrismaService.participant.findMany).toHaveBeenCalled();
    });
  });

  describe('UpdateParticipantController', () => {
    it('should update participant role', async () => {
      const result = await updateController.update('part-1', {
        role: 'ADMIN',
      });
      expect(result).toEqual({ data: mockParticipant });
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValueOnce(null);
      await expect(
        updateController.update('nonexistent', { role: 'ADMIN' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when participant has left', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValueOnce({
        ...mockParticipant,
        leftAt: new Date(),
      });
      await expect(
        updateController.update('part-1', { role: 'ADMIN' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('RemoveParticipantController', () => {
    it('should soft-remove a participant', async () => {
      const result = await removeController.remove('part-1');
      expect(result).toEqual({
        data: mockParticipant,
        message: 'Participant removed',
      });
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValueOnce(null);
      await expect(removeController.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when participant already left', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValueOnce({
        ...mockParticipant,
        leftAt: new Date(),
      });
      await expect(removeController.remove('part-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
