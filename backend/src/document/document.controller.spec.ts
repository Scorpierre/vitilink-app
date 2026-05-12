import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: jest.Mocked<DocumentService>;

  const req = { user: { userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            listEntrepriseDocuments: jest.fn(),
            uploadEntrepriseDocument: jest.fn(),
            deleteDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get(DocumentService);
  });

  describe('listEntrepriseDocuments', () => {
    it('should return list of documents', async () => {
      documentService.listEntrepriseDocuments.mockResolvedValue([{ id: 'doc-1' }] as any);

      const result = await controller.listEntrepriseDocuments(req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.result).toHaveLength(1);
    });
  });

  describe('uploadEntrepriseDocument', () => {
    it('should throw BadRequestException if no file provided', async () => {
      await expect(
        controller.uploadEntrepriseDocument(undefined as any, 'KBIS', '', req),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no type provided', async () => {
      await expect(
        controller.uploadEntrepriseDocument({ filename: 'f.pdf' } as any, '', '', req),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload document and return CREATED', async () => {
      documentService.uploadEntrepriseDocument.mockResolvedValue({ id: 'doc-1' } as any);

      const result = await controller.uploadEntrepriseDocument(
        { filename: 'f.pdf' } as any,
        'KBIS',
        'Mon KBIS',
        req,
      );
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.result).toMatchObject({ id: 'doc-1' });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and return OK', async () => {
      documentService.deleteDocument.mockResolvedValue({ success: true, message: 'Document supprimé.' });

      const result = await controller.deleteDocument('doc-1', req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Document supprimé.');
    });
  });
});
