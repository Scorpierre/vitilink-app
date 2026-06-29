import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AnnonceStatus } from '@prisma/client';
import { AnnonceService } from './annonce.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockAnnonce = {
  id: 'annonce-1',
  title: 'Vin rouge bio',
  creatorUserId: 'user-1',
  status: AnnonceStatus.PUBLISHED,
  images: ['/uploads/annonces/img1.jpg'],
};

describe('AnnonceService', () => {
  let service: AnnonceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      annonce: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        count: jest.fn().mockResolvedValue(0),
      },
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnonceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnnonceService>(AnnonceService);
  });

  describe('listMarketplace', () => {
    it('should list published annonces without filters', async () => {
      prisma.annonce.findMany.mockResolvedValue([mockAnnonce]);

      const result = await service.listMarketplace({});
      expect(result).toHaveLength(1);
    });

    it('should apply region filter', async () => {
      prisma.annonce.findMany.mockResolvedValue([]);

      await service.listMarketplace({ region: 'Bordeaux' });

      expect(prisma.annonce.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ region: 'Bordeaux' }),
        }),
      );
    });

    it('should apply productType filter', async () => {
      prisma.annonce.findMany.mockResolvedValue([]);

      await service.listMarketplace({ productType: 'Vin en vrac' });

      expect(prisma.annonce.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productType: 'Vin en vrac' }),
        }),
      );
    });

    it('should apply full-text search query with OR clause', async () => {
      prisma.annonce.findMany.mockResolvedValue([]);

      await service.listMarketplace({ q: 'bio' });

      expect(prisma.annonce.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });
  });

  describe('listMine', () => {
    it('should throw UnauthorizedException if userId is empty', async () => {
      await expect(service.listMine('')).rejects.toThrow(UnauthorizedException);
    });

    it('should return annonces for the user', async () => {
      prisma.annonce.findMany.mockResolvedValue([mockAnnonce]);

      const result = await service.listMine('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if annonce not found', async () => {
      prisma.annonce.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('should return annonce when found', async () => {
      prisma.annonce.findUnique.mockResolvedValue(mockAnnonce);

      const result = await service.findOne('annonce-1');
      expect(result.id).toBe('annonce-1');
    });
  });

  describe('create', () => {
    it('should throw UnauthorizedException if userId is empty', async () => {
      await expect(service.create('', { title: 'Test' } as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', { title: 'Test' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user has no entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: null });

      await expect(service.create('user-1', { title: 'Test' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if title is empty/whitespace', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });

      await expect(service.create('user-1', { title: '  ', certifications: [] } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-numeric price', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });

      await expect(
        service.create('user-1', { title: 'Test', price: 'abc', certifications: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-integer vintage', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });

      await expect(
        service.create('user-1', { title: 'Test', vintage: '20.5', certifications: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create annonce with image files', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });
      prisma.annonce.create.mockResolvedValue({ ...mockAnnonce, id: 'new-annonce' });

      const files = [{ filename: 'photo.jpg' }];
      const result = await service.create(
        'user-1',
        { title: 'Vin rouge', certifications: [], restrictToVerified: 'false' } as any,
        files,
      );

      expect(result.id).toBe('new-annonce');
    });

    it('should handle undefined certifications gracefully', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });
      prisma.annonce.create.mockResolvedValue(mockAnnonce);

      await service.create('user-1', { title: 'Test' } as any);

      expect(prisma.annonce.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ certifications: [] }),
        }),
      );
    });

    it('should parse valid numeric price and integer vintage', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });
      prisma.annonce.create.mockResolvedValue(mockAnnonce);

      await service.create('user-1', {
        title: 'Test',
        price: '1500',
        vintage: '2020',
        certifications: [],
      } as any);

      expect(prisma.annonce.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ price: 1500, vintage: 2020 }),
        }),
      );
    });

    it('should build location from city and region when not provided', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });
      prisma.annonce.create.mockResolvedValue(mockAnnonce);

      await service.create(
        'user-1',
        { title: 'Test', city: 'Bordeaux', region: 'Nouvelle-Aquitaine', certifications: [] } as any,
      );

      expect(prisma.annonce.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ location: 'Bordeaux, Nouvelle-Aquitaine' }),
        }),
      );
    });

    it('should handle certifications as comma-separated string', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: 'ent-1' });
      prisma.annonce.create.mockResolvedValue(mockAnnonce);

      await service.create(
        'user-1',
        { title: 'Test', certifications: 'Bio,HVE' } as any,
      );

      expect(prisma.annonce.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ certifications: ['Bio', 'HVE'] }),
        }),
      );
    });
  });

  describe('updateMine', () => {
    it('should throw NotFoundException if annonce not found', async () => {
      prisma.annonce.findUnique.mockResolvedValue(null);

      await expect(service.updateMine('missing', 'user-1', { title: 'T' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      prisma.annonce.findUnique.mockResolvedValue({ ...mockAnnonce, creatorUserId: 'other-user' });

      await expect(service.updateMine('annonce-1', 'user-1', { title: 'T' } as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if title is empty', async () => {
      prisma.annonce.findUnique.mockResolvedValue(mockAnnonce);

      await expect(
        service.updateMine('annonce-1', 'user-1', { title: '  ', certifications: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should keep existing images that are still referenced', async () => {
      prisma.annonce.findUnique.mockResolvedValue(mockAnnonce);
      prisma.annonce.update.mockResolvedValue({ ...mockAnnonce, title: 'Updated' });

      const result = await service.updateMine('annonce-1', 'user-1', {
        title: 'Updated',
        certifications: [],
        existingImages: ['/uploads/annonces/img1.jpg'],
      } as any);

      expect(result.title).toBe('Updated');
    });

    it('should drop existing images when existingImages is empty array', async () => {
      prisma.annonce.findUnique.mockResolvedValue(mockAnnonce);
      prisma.annonce.update.mockResolvedValue({ ...mockAnnonce, images: [] });

      await service.updateMine('annonce-1', 'user-1', {
        title: 'Updated',
        certifications: [],
        existingImages: [],
      } as any);

      expect(prisma.annonce.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ images: [] }),
        }),
      );
    });

    it('should keep all existing images when existingImages is undefined', async () => {
      prisma.annonce.findUnique.mockResolvedValue(mockAnnonce);
      prisma.annonce.update.mockResolvedValue(mockAnnonce);

      await service.updateMine('annonce-1', 'user-1', {
        title: 'Updated',
        certifications: [],
      } as any);

      expect(prisma.annonce.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ images: ['/uploads/annonces/img1.jpg'] }),
        }),
      );
    });
  });

  describe('archiveMine', () => {
    it('should throw NotFoundException if annonce not found', async () => {
      prisma.annonce.findUnique.mockResolvedValue(null);

      await expect(service.archiveMine('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      prisma.annonce.findUnique.mockResolvedValue({ ...mockAnnonce, creatorUserId: 'other' });

      await expect(service.archiveMine('annonce-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should archive annonce successfully', async () => {
      prisma.annonce.findUnique.mockResolvedValue(mockAnnonce);
      prisma.annonce.update.mockResolvedValue({ ...mockAnnonce, status: AnnonceStatus.ARCHIVED });

      const result = await service.archiveMine('annonce-1', 'user-1');
      expect(result.status).toBe(AnnonceStatus.ARCHIVED);
    });
  });
});
