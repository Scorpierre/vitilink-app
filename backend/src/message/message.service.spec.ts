import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';

const mockConversation = {
  id: 'conv-1',
  buyerId: 'buyer-1',
  annonce: { creatorUserId: 'seller-1' },
};

describe('MessageService', () => {
  let service: MessageService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      conversation: { findUnique: jest.fn(), update: jest.fn() },
      message: { create: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  describe('create', () => {
    it('should throw NotFoundException if conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', 'missing', 'Hello')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if sender is not a participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(service.create('stranger', 'conv-1', 'Hi')).rejects.toThrow(ForbiddenException);
    });

    it('should create message and update conversation timestamp as buyer', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.message.create.mockResolvedValue({
        id: 'msg-1',
        content: 'Hello',
        sender: { id: 'buyer-1', username: 'buyer' },
      });
      prisma.conversation.update.mockResolvedValue({});

      const result = await service.create('buyer-1', 'conv-1', 'Hello');

      expect(result.id).toBe('msg-1');
      expect(prisma.conversation.update).toHaveBeenCalled();
    });

    it('should create message as seller', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.message.create.mockResolvedValue({
        id: 'msg-2',
        content: 'Reply',
        sender: { id: 'seller-1', username: 'seller' },
      });
      prisma.conversation.update.mockResolvedValue({});

      const result = await service.create('seller-1', 'conv-1', 'Reply');
      expect(result.id).toBe('msg-2');
    });
  });

  describe('findByConversation', () => {
    it('should throw NotFoundException if conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findByConversation('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(service.findByConversation('conv-1', 'stranger')).rejects.toThrow(ForbiddenException);
    });

    it('should return messages for buyer', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.message.findMany.mockResolvedValue([{ id: 'msg-1' }]);

      const result = await service.findByConversation('conv-1', 'buyer-1');
      expect(result).toHaveLength(1);
    });

    it('should return messages for seller', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.message.findMany.mockResolvedValue([{ id: 'msg-1' }, { id: 'msg-2' }]);

      const result = await service.findByConversation('conv-1', 'seller-1');
      expect(result).toHaveLength(2);
    });
  });
});
