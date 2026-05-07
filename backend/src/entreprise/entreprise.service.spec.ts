import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntrepriseService } from './entreprise.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('EntrepriseService', () => {
  let service: EntrepriseService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      entreprise: { create: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntrepriseService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EntrepriseService>(EntrepriseService);
  });

  describe('getMine', () => {
    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMine('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return null if user has no entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entreprise: null });

      const result = await service.getMine('user-1');
      expect(result).toBeNull();
    });

    it('should return entreprise when user has one', async () => {
      const mockEntreprise = { id: 'ent-1', name: 'Vigneron SA', documents: [] };
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entreprise: mockEntreprise });

      const result = await service.getMine('user-1');
      expect(result?.id).toBe('ent-1');
    });
  });

  describe('updateMine', () => {
    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateMine('user-1', { name: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('should create new entreprise and link it to user if user has none', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: null, entreprise: null });
      prisma.entreprise.create.mockResolvedValue({ id: 'new-ent', name: 'New Co' });
      prisma.user.update.mockResolvedValue({});

      const result = await service.updateMine('user-1', { name: 'New Co' });

      expect(prisma.entreprise.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { entrepriseId: 'new-ent' },
      });
      expect(result.id).toBe('new-ent');
    });

    it('should use defaults when creating entreprise with missing fields', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', entrepriseId: null, entreprise: null });
      prisma.entreprise.create.mockResolvedValue({ id: 'new-ent', name: 'Mon entreprise' });
      prisma.user.update.mockResolvedValue({});

      await service.updateMine('user-1', {});

      expect(prisma.entreprise.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Mon entreprise',
            type: 'OTHER',
            country: 'France',
          }),
        }),
      );
    });

    it('should update existing entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        entrepriseId: 'ent-1',
        entreprise: { id: 'ent-1' },
      });
      prisma.entreprise.update.mockResolvedValue({ id: 'ent-1', name: 'Updated Co' });

      const result = await service.updateMine('user-1', { name: 'Updated Co' });

      expect(prisma.entreprise.update).toHaveBeenCalled();
      expect(result.id).toBe('ent-1');
    });
  });
});
