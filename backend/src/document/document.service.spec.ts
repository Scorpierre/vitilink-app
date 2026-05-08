import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockFile = {
  filename: '1234-kbis.pdf',
  originalname: 'kbis.pdf',
  mimetype: 'application/pdf',
  size: 50000,
};

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      document: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      entreprise: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  describe('listEntrepriseDocuments', () => {
    it('should return empty array if user has no entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: null });

      const result = await service.listEntrepriseDocuments('user-1');
      expect(result).toEqual([]);
      expect(prisma.document.findMany).not.toHaveBeenCalled();
    });

    it('should return documents for the user entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: 'ent-1' });
      prisma.document.findMany.mockResolvedValue([{ id: 'doc-1' }]);

      const result = await service.listEntrepriseDocuments('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('uploadEntrepriseDocument', () => {
    it('should throw NotFoundException if user has no entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: null });

      await expect(
        service.uploadEntrepriseDocument({ userId: 'user-1', type: 'KBIS', file: mockFile }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create document and reset entreprise status to PENDING', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: 'ent-1' });
      prisma.document.create.mockResolvedValue({ id: 'doc-1', url: '/uploads/entreprise/1234-kbis.pdf' });
      prisma.entreprise.update.mockResolvedValue({});

      const result = await service.uploadEntrepriseDocument({
        userId: 'user-1',
        type: 'KBIS',
        label: 'Mon KBIS',
        file: mockFile,
      });

      expect(result.id).toBe('doc-1');
      expect(prisma.entreprise.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING', verificationNote: null, verifiedAt: null }),
        }),
      );
    });
  });

  describe('deleteDocument', () => {
    it('should throw NotFoundException if user has no entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: null });

      await expect(service.deleteDocument('doc-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if document not found', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: 'ent-1' });
      prisma.document.findUnique.mockResolvedValue(null);

      await expect(service.deleteDocument('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if document belongs to a different entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: 'ent-1' });
      prisma.document.findUnique.mockResolvedValue({ id: 'doc-1', entrepriseId: 'ent-other' });

      await expect(service.deleteDocument('doc-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should delete document and return success', async () => {
      prisma.user.findUnique.mockResolvedValue({ entrepriseId: 'ent-1' });
      prisma.document.findUnique.mockResolvedValue({ id: 'doc-1', entrepriseId: 'ent-1' });
      prisma.document.delete.mockResolvedValue({});

      const result = await service.deleteDocument('doc-1', 'user-1');
      expect(result.success).toBe(true);
    });
  });
});
