import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockRes = () => {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should set httpOnly cookie and return 200 with user', async () => {
      const user = { id: 'user-1', username: 'test', email: 'test@test.com' };
      authService.validateUser.mockResolvedValue(user as any);
      authService.login.mockResolvedValue({ access_token: 'jwt-token' });

      const res = mockRes();
      await controller.login({ email: 'test@test.com', password: 'pass' }, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ result: user }));
    });
  });

  describe('me', () => {
    it('should return user data without password if token valid', async () => {
      const user = { id: 'user-1', username: 'test', email: 'test@test.com', password: 'hashed' };
      authService.verifyToken.mockResolvedValue(user as any);

      const req = { cookies: { token: 'valid-token' } } as any;
      const res = mockRes();
      await controller.me(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.result).not.toHaveProperty('password');
    });

    it('should return 401 if no token in cookies', async () => {
      const req = { cookies: {} } as any;
      const res = mockRes();
      await controller.me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if verifyToken throws', async () => {
      authService.verifyToken.mockRejectedValue(new Error('invalid'));

      const req = { cookies: { token: 'bad-token' } } as any;
      const res = mockRes();
      await controller.me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('should clear token cookie and return 200', () => {
      const res = mockRes();
      controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
