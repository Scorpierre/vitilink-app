import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnnonceStatus, EntrepriseStatus } from '@prisma/client';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma/prisma.service';

const publishedAnnonce = {
  id: 'annonce-1',
  creatorUserId: 'seller-1',
  status: AnnonceStatus.PUBLISHED,
  restrictToVerified: false,
};

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      annonce: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      conversation: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  describe('create', () => {
    it('should create conversation when everything is valid', async () => {
      prisma.annonce.findUnique.mockResolvedValue(publishedAnnonce);
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.conversation.create.mockResolvedValue({ id: 'conv-1', messages: [] });

      const result = await service.create('buyer-1', { annonceId: 'annonce-1' });
      expect(result.id).toBe('conv-1');
    });

    it('should throw NotFoundException if annonce not found', async () => {
      prisma.annonce.findUnique.mockResolvedValue(null);

      await expect(service.create('buyer-1', { annonceId: 'missing' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if buyer is the creator', async () => {
      prisma.annonce.findUnique.mockResolvedValue(publishedAnnonce);

      await expect(service.create('seller-1', { annonceId: 'annonce-1' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if annonce is not published', async () => {
      prisma.annonce.findUnique.mockResolvedValue({ ...publishedAnnonce, status: AnnonceStatus.ARCHIVED });

      await expect(service.create('buyer-1', { annonceId: 'annonce-1' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if restricted and buyer entreprise not verified', async () => {
      prisma.annonce.findUnique.mockResolvedValue({ ...publishedAnnonce, restrictToVerified: true });
      prisma.user.findUnique.mockResolvedValue({ entreprise: { status: EntrepriseStatus.PENDING } });

      await expect(service.create('buyer-1', { annonceId: 'annonce-1' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if restricted and buyer has no entreprise', async () => {
      prisma.annonce.findUnique.mockResolvedValue({ ...publishedAnnonce, restrictToVerified: true });
      prisma.user.findUnique.mockResolvedValue({ entreprise: null });

      await expect(service.create('buyer-1', { annonceId: 'annonce-1' })).rejects.toThrow(ForbiddenException);
    });

    it('should allow access if restricted and buyer is verified', async () => {
      prisma.annonce.findUnique.mockResolvedValue({ ...publishedAnnonce, restrictToVerified: true });
      prisma.user.findUnique.mockResolvedValue({ entreprise: { status: EntrepriseStatus.VERIFIED } });
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.conversation.create.mockResolvedValue({ id: 'conv-2', messages: [] });

      const result = await service.create('buyer-1', { annonceId: 'annonce-1' });
      expect(result.id).toBe('conv-2');
    });

    it('should return existing conversation if already exists', async () => {
      const existing = { id: 'existing-conv', annonceId: 'annonce-1', buyerId: 'buyer-1' };
      prisma.annonce.findUnique.mockResolvedValue(publishedAnnonce);
      prisma.conversation.findUnique.mockResolvedValue(existing);

      const result = await service.create('buyer-1', { annonceId: 'annonce-1' });
      expect(result.id).toBe('existing-conv');
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return all conversations for the user', async () => {
      prisma.conversation.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);

      const result = await service.findByUser('user-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return conversation for buyer participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        buyerId: 'buyer-1',
        annonce: { creatorUserId: 'seller-1' },
        messages: [],
      });

      const result = await service.findOne('conv-1', 'buyer-1');
      expect(result.id).toBe('conv-1');
    });

    it('should return conversation for seller participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        buyerId: 'buyer-1',
        annonce: { creatorUserId: 'seller-1' },
        messages: [],
      });

      const result = await service.findOne('conv-1', 'seller-1');
      expect(result.id).toBe('conv-1');
    });

    it('should throw NotFoundException if conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        buyerId: 'buyer-1',
        annonce: { creatorUserId: 'seller-1' },
        messages: [],
      });

      await expect(service.findOne('conv-1', 'stranger')).rejects.toThrow(ForbiddenException);
    });
  });
});
