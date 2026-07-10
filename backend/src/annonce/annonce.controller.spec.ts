import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AnnonceController } from './annonce.controller';
import { AnnonceService } from './annonce.service';

describe('AnnonceController', () => {
  let controller: AnnonceController;
  let annonceService: jest.Mocked<AnnonceService>;

  const req = { user: { userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnonceController],
      providers: [
        {
          provide: AnnonceService,
          useValue: {
            listMarketplace: jest.fn(),
            listMine: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateMine: jest.fn(),
            archiveMine: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnnonceController>(AnnonceController);
    annonceService = module.get(AnnonceService);
  });

  describe('listMarketplace', () => {
    it('should return all marketplace annonces', async () => {
      annonceService.listMarketplace.mockResolvedValue([]);

      const result = await controller.listMarketplace();
      expect(result.status).toBe(HttpStatus.OK);
    });

    it('should forward query filters to service', async () => {
      annonceService.listMarketplace.mockResolvedValue([]);

      await controller.listMarketplace('bio', 'Bordeaux', 'Raisin');

      expect(annonceService.listMarketplace).toHaveBeenCalledWith({
        q: 'bio',
        region: 'Bordeaux',
        productType: 'Raisin',
      });
    });
  });

  describe('listMine', () => {
    it('should return annonces for the current user', async () => {
      annonceService.listMine.mockResolvedValue([]);

      const result = await controller.listMine(req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(annonceService.listMine).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('should return a single annonce', async () => {
      annonceService.findOne.mockResolvedValue({ id: 'annonce-1' } as any);

      const result = await controller.findOne('annonce-1', req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.result).toMatchObject({ id: 'annonce-1' });
      expect(annonceService.findOne).toHaveBeenCalledWith('annonce-1', 'user-1');
    });
  });

  describe('create', () => {
    it('should create annonce and return CREATED', async () => {
      annonceService.create.mockResolvedValue({ id: 'new' } as any);
      const imageFile = { filename: 'photo.jpg' };
      const documentFile = { filename: 'analyse.pdf' };
      const dto = { title: 'New', certifications: [], images: [] } as any;

      const result = await controller.create(
        { images: [imageFile], documents: [documentFile] },
        dto,
        req,
      );
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Annonce publiée.');
      expect(annonceService.create).toHaveBeenCalledWith('user-1', dto, [imageFile], [documentFile]);
    });
  });

  describe('updateMine', () => {
    it('should update annonce and return OK', async () => {
      annonceService.updateMine.mockResolvedValue({ id: 'annonce-1' } as any);
      const imageFile = { filename: 'photo.jpg' };
      const documentFile = { filename: 'analyse.pdf' };
      const dto = { title: 'Updated' } as any;

      const result = await controller.updateMine(
        'annonce-1',
        { images: [imageFile], documents: [documentFile] },
        dto,
        req,
      );
      expect(result.status).toBe(HttpStatus.OK);
      expect(annonceService.updateMine).toHaveBeenCalledWith('annonce-1', 'user-1', dto, [imageFile], [documentFile]);
    });
  });

  describe('archiveMine', () => {
    it('should archive annonce and return OK', async () => {
      annonceService.archiveMine.mockResolvedValue({ id: 'annonce-1', status: 'ARCHIVED' } as any);

      const result = await controller.archiveMine('annonce-1', req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Annonce archivée.');
    });
  });
});
