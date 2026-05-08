import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/users.service';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  username: 'testuser',
  password: 'hashed-password',
  role: 'BUYER',
  firstName: null,
  lastName: null,
  phone: null,
  entrepriseId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  entreprise: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password on valid credentials', async () => {
      userService.findOneByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe('user-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(service.validateUser('bad@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.findOneByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.validateUser('test@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return an access_token', async () => {
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({ id: 'user-1', username: 'testuser' });

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'testuser', sub: 'user-1' });
    });
  });

  describe('verifyToken', () => {
    it('should return user for valid token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      userService.findById.mockResolvedValue(mockUser as any);

      const result = await service.verifyToken('valid-token');

      expect(result.id).toBe('user-1');
    });

    it('should throw UnauthorizedException if user not found after valid token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'ghost' });
      userService.findById.mockResolvedValue(null);

      await expect(service.verifyToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.verifyToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
