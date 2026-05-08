import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { EntrepriseController } from './entreprise.controller';
import { EntrepriseService } from './entreprise.service';

describe('EntrepriseController', () => {
  let controller: EntrepriseController;
  let entrepriseService: jest.Mocked<EntrepriseService>;

  const req = { user: { userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntrepriseController],
      providers: [
        {
          provide: EntrepriseService,
          useValue: {
            getMine: jest.fn(),
            updateMine: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EntrepriseController>(EntrepriseController);
    entrepriseService = module.get(EntrepriseService);
  });

  describe('getMine', () => {
    it('should return entreprise wrapped in standard response', async () => {
      entrepriseService.getMine.mockResolvedValue({ id: 'ent-1', name: 'Vignoble SA' } as any);

      const result = await controller.getMine(req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.result).toMatchObject({ id: 'ent-1' });
    });
  });

  describe('updateMine', () => {
    it('should update and return entreprise with success message', async () => {
      entrepriseService.updateMine.mockResolvedValue({ id: 'ent-1', name: 'Updated' } as any);

      const result = await controller.updateMine({ name: 'Updated' } as any, req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Entreprise mise à jour.');
    });
  });
});
