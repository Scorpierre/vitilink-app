import { JwtStrategy, extractCookieToken } from './jwt.strategy';

describe('extractCookieToken', () => {
  it('should return token from cookies', () => {
    const req = { cookies: { token: 'my-jwt' } } as any;
    expect(extractCookieToken(req)).toBe('my-jwt');
  });

  it('should return null when token cookie is missing', () => {
    const req = { cookies: {} } as any;
    expect(extractCookieToken(req)).toBeNull();
  });

  it('should return null when cookies is undefined', () => {
    const req = {} as any;
    expect(extractCookieToken(req)).toBeNull();
  });

  it('should return null when request is undefined', () => {
    expect(extractCookieToken(undefined as any)).toBeNull();
  });
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload and return userId + username', async () => {
    const payload = { sub: 'user-1', username: 'testuser' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ userId: 'user-1', username: 'testuser' });
  });
});
