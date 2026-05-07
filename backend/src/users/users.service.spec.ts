import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';

const baseUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@test.com',
  password: 'hashed',
  role: 'BUYER',
  firstName: null,
  lastName: null,
  phone: null,
  entrepriseId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: jest.Mocked<any> };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('signup', () => {
    const dto = { username: 'testuser', email: 'test@test.com', password: 'pass', passwordConfirm: 'pass' };

    it('should create user and return result without password', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValue(baseUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      const result = await service.signup(dto);

      expect(result.status).toBe(201);
      expect(result.result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if email already used', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(service.signup(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if username already used', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'existing' });

      await expect(service.signup(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return user with entreprise', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, entreprise: null });

      const result = await service.findById('user-1');
      expect(result?.id).toBe('user-1');
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);

      const result = await service.findOneByEmail('test@test.com');
      expect(result?.email).toBe('test@test.com');
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return success', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue(baseUser);

      const result = await service.updateProfile({ username: 'newname' }, 'user-1');
      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException if username taken by another user', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'other-user' });

      await expect(service.updateProfile({ username: 'taken' }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should skip username check if no username provided', async () => {
      prisma.user.update.mockResolvedValue(baseUser);

      const result = await service.updateProfile({ firstName: 'Pierre' }, 'user-1');
      expect(result.success).toBe(true);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });
});
