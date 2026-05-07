import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http } from './http';

describe('http', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should return parsed JSON on successful response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'ok' }),
    } as any);

    const result = await http('/test');
    expect(result).toEqual({ result: 'ok' });
  });

  it('should include credentials and JSON content-type by default', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as any);

    await http('/test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('should merge custom headers with defaults', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as any);

    await http('/test', { headers: { Authorization: 'Bearer token' } });

    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        }),
      }),
    );
  });

  it('should throw error with message from response body when not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ message: 'Validation failed' }),
    } as any);

    await expect(http('/test')).rejects.toThrow('Validation failed');
  });

  it('should throw error with statusText when body has no message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as any);

    await expect(http('/test')).rejects.toThrow('Internal Server Error');
  });

  it('should throw fallback error when json parsing fails and response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: '',
      json: () => Promise.reject(new Error('not json')),
    } as any);

    await expect(http('/test')).rejects.toThrow('Erreur inconnue');
  });
});

describe('http with custom VITE_API_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should prefix URL with VITE_API_URL when set', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();

    const { http: httpWithEnv } = await import('./http');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'ok' }),
    }));

    await httpWithEnv('/endpoint');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/endpoint',
      expect.any(Object),
    );
  });
});
