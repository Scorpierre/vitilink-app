import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';

const mockUser = {
  id: 'user-1',
  username: 'test',
  email: 'test@test.com',
  password: 'hashed',
  role: 'BUYER',
  entreprise: null,
} as any;

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            signup: jest.fn(),
            findById: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  describe('signup', () => {
    it('should delegate to userService.signup', async () => {
      const dto = { username: 'test', email: 'test@test.com', password: 'pass', passwordConfirm: 'pass' };
      userService.signup.mockResolvedValue({ status: 201, message: 'Créé.', result: {} as any });

      const result = await controller.signup(dto);
      expect(userService.signup).toHaveBeenCalledWith(dto);
      expect(result.status).toBe(201);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      userService.findById.mockResolvedValue(mockUser);
      const req = { user: { userId: 'user-1' } };

      const result = await controller.getProfile(req);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.result).not.toHaveProperty('password');
    });

    it('should return NOT_FOUND if user does not exist', async () => {
      userService.findById.mockResolvedValue(null);
      const req = { user: { userId: 'ghost' } };

      const result = await controller.getProfile(req);
      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('updateProfile', () => {
    it('should return OK on successful update', async () => {
      userService.updateProfile.mockResolvedValue({ success: true, message: 'Profil mis à jour.' });
      const req = { user: { userId: 'user-1' } };

      const result = await controller.updateProfile({ username: 'new' }, req);
      expect(result.status).toBe(HttpStatus.OK);
    });

    it('should return BAD_REQUEST when success is false', async () => {
      userService.updateProfile.mockResolvedValue({ success: false, message: 'Erreur.' });
      const req = { user: { userId: 'user-1' } };

      const result = await controller.updateProfile({ username: 'new' }, req);
      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
