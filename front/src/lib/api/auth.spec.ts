import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthAPI } from './auth';

vi.mock('./http', () => ({
  http: vi.fn(),
}));

import { http } from './http';
const mockedHttp = vi.mocked(http);

describe('AuthAPI', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  describe('login', () => {
    it('should POST to /auth/login with credentials', async () => {
      const mockResponse = { message: 'ok', result: { id: 'u1' } };
      mockedHttp.mockResolvedValue(mockResponse as any);

      const result = await AuthAPI.login({ email: 'test@test.com', password: 'pass' });

      expect(mockedHttp).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('me', () => {
    it('should GET /auth/me', async () => {
      const mockResponse = { message: 'ok', result: { id: 'u1' } };
      mockedHttp.mockResolvedValue(mockResponse as any);

      const result = await AuthAPI.me();

      expect(mockedHttp).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should POST to /auth/logout', async () => {
      mockedHttp.mockResolvedValue(undefined as any);

      await AuthAPI.logout();

      expect(mockedHttp).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
    });
  });

  describe('signup', () => {
    it('should POST to /user/signup with user data', async () => {
      mockedHttp.mockResolvedValue(undefined as any);

      await AuthAPI.signup({
        username: 'pierre',
        email: 'pierre@test.com',
        password: 'pass',
        passwordConfirm: 'pass',
      });

      expect(mockedHttp).toHaveBeenCalledWith('/user/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: 'pierre',
          email: 'pierre@test.com',
          password: 'pass',
          passwordConfirm: 'pass',
        }),
      });
    });
  });
});
