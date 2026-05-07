import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  imageUrl,
  formatVolume,
  formatPrice,
  statusLabel,
  statusClass,
  PRODUCT_TYPES,
  REGIONS,
  DEFAULT_CERTIFICATIONS,
} from './annonce';
import type { Annonce } from '$lib/types';

const baseAnnonce: Annonce = {
  id: 'a1',
  title: 'Vin rouge',
  status: 'PUBLISHED',
  certifications: [],
  images: [],
  restrictToVerified: false,
  creatorUserId: 'u1',
  entrepriseId: 'e1',
};

describe('imageUrl', () => {
  it('should return empty string for undefined path', () => {
    expect(imageUrl(undefined)).toBe('');
  });

  it('should return URL as-is if it starts with http', () => {
    expect(imageUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
  });

  it('should prefix path with API_BASE for relative paths', () => {
    const result = imageUrl('/uploads/annonces/photo.jpg');
    expect(result).toBe('http://localhost:3000/uploads/annonces/photo.jpg');
  });
});

describe('formatVolume', () => {
  it('should return "Volume à préciser" when no volume', () => {
    expect(formatVolume({ ...baseAnnonce })).toBe('Volume à préciser');
  });

  it('should format volume with unit', () => {
    const result = formatVolume({ ...baseAnnonce, volume: 500, volumeUnit: 'hl' });
    expect(result).toContain('500');
    expect(result).toContain('hl');
  });

  it('should use default unit "hl" when volumeUnit is not provided', () => {
    const result = formatVolume({ ...baseAnnonce, volume: 200 });
    expect(result).toContain('hl');
  });
});

describe('formatPrice', () => {
  it('should return "Prix sur demande" when price is undefined', () => {
    expect(formatPrice(undefined)).toBe('Prix sur demande');
  });

  it('should return "Prix sur demande" when price is 0', () => {
    expect(formatPrice(0)).toBe('Prix sur demande');
  });

  it('should format price as EUR currency', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
    expect(result).toMatch(/€|EUR/);
  });
});

describe('statusLabel', () => {
  it('should return "Publiée" for PUBLISHED', () => {
    expect(statusLabel('PUBLISHED')).toBe('Publiée');
  });

  it('should return "Archivée" for ARCHIVED', () => {
    expect(statusLabel('ARCHIVED')).toBe('Archivée');
  });

  it('should return "Vendue" for SOLD', () => {
    expect(statusLabel('SOLD')).toBe('Vendue');
  });

  it('should return "Brouillon" for unknown status', () => {
    expect(statusLabel('DRAFT')).toBe('Brouillon');
  });
});

describe('statusClass', () => {
  it('should return emerald classes for PUBLISHED', () => {
    expect(statusClass('PUBLISHED')).toContain('emerald');
  });

  it('should return zinc classes for ARCHIVED', () => {
    expect(statusClass('ARCHIVED')).toContain('zinc');
  });

  it('should return blue classes for SOLD', () => {
    expect(statusClass('SOLD')).toContain('blue');
  });

  it('should return amber classes for unknown status', () => {
    expect(statusClass('DRAFT')).toContain('amber');
  });
});

describe('imageUrl with custom VITE_API_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should use VITE_API_URL when set', async () => {
    vi.stubEnv('VITE_API_URL', 'https://custom.example.com');
    vi.resetModules();
    const { imageUrl: imageUrlWithEnv } = await import('./annonce');

    expect(imageUrlWithEnv('/uploads/photo.jpg')).toBe('https://custom.example.com/uploads/photo.jpg');
  });
});

describe('constants', () => {
  it('PRODUCT_TYPES should be a non-empty array', () => {
    expect(Array.isArray(PRODUCT_TYPES)).toBe(true);
    expect(PRODUCT_TYPES.length).toBeGreaterThan(0);
  });

  it('REGIONS should be a non-empty array', () => {
    expect(Array.isArray(REGIONS)).toBe(true);
    expect(REGIONS.length).toBeGreaterThan(0);
  });

  it('DEFAULT_CERTIFICATIONS should be a non-empty array', () => {
    expect(Array.isArray(DEFAULT_CERTIFICATIONS)).toBe(true);
    expect(DEFAULT_CERTIFICATIONS.length).toBeGreaterThan(0);
  });
});
