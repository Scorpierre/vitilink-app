import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import {
  annonceDestination,
  annonceFilename,
  annonceFileFilter,
  entrepriseDestination,
  entrepriseFilename,
  entrepriseFileFilter,
} from './multer.helpers';

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
}));

describe('multer helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('annonceDestination', () => {
    it('should create directory and call cb with upload path', () => {
      const cb = jest.fn();
      annonceDestination(null, null, cb);
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('uploads/annonces'), { recursive: true });
      expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('uploads/annonces'));
    });
  });

  describe('annonceFilename', () => {
    it('should replace special chars and prefix with timestamp', () => {
      const cb = jest.fn();
      const file = { originalname: 'photo de vin.jpg' };
      annonceFilename(null, file, cb);
      const [err, name] = cb.mock.calls[0];
      expect(err).toBeNull();
      expect(name).toMatch(/^\d+-photo-de-vin\.jpg$/);
    });

    it('should keep alphanumeric chars, dots, hyphens and underscores', () => {
      const cb = jest.fn();
      const file = { originalname: 'valid_file-name.123.jpg' };
      annonceFilename(null, file, cb);
      const [, name] = cb.mock.calls[0];
      expect(name).toContain('valid_file-name.123.jpg');
    });
  });

  describe('annonceFileFilter', () => {
    it('should accept image/png', () => {
      const cb = jest.fn();
      annonceFileFilter(null, { mimetype: 'image/png' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/jpeg', () => {
      const cb = jest.fn();
      annonceFileFilter(null, { mimetype: 'image/jpeg' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/webp', () => {
      const cb = jest.fn();
      annonceFileFilter(null, { mimetype: 'image/webp' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-image files with BadRequestException', () => {
      const cb = jest.fn();
      annonceFileFilter(null, { mimetype: 'application/pdf' }, cb);
      const [err, accept] = cb.mock.calls[0];
      expect(err).toBeInstanceOf(BadRequestException);
      expect(accept).toBe(false);
    });
  });

  describe('entrepriseDestination', () => {
    it('should create directory and call cb with upload path', () => {
      const cb = jest.fn();
      entrepriseDestination(null, null, cb);
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('uploads/entreprise'), { recursive: true });
      expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('uploads/entreprise'));
    });
  });

  describe('entrepriseFilename', () => {
    it('should replace spaces with hyphens and prefix with timestamp', () => {
      const cb = jest.fn();
      const file = { originalname: 'mon kbis 2024.pdf' };
      entrepriseFilename(null, file, cb);
      const [err, name] = cb.mock.calls[0];
      expect(err).toBeNull();
      expect(name).toMatch(/^\d+-mon-kbis-2024\.pdf$/);
    });
  });

  describe('entrepriseFileFilter', () => {
    it('should accept application/pdf', () => {
      const cb = jest.fn();
      entrepriseFileFilter(null, { mimetype: 'application/pdf' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/png', () => {
      const cb = jest.fn();
      entrepriseFileFilter(null, { mimetype: 'image/png' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/jpeg', () => {
      const cb = jest.fn();
      entrepriseFileFilter(null, { mimetype: 'image/jpeg' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/webp', () => {
      const cb = jest.fn();
      entrepriseFileFilter(null, { mimetype: 'image/webp' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject other file types with BadRequestException', () => {
      const cb = jest.fn();
      entrepriseFileFilter(null, { mimetype: 'text/plain' }, cb);
      const [err, accept] = cb.mock.calls[0];
      expect(err).toBeInstanceOf(BadRequestException);
      expect(accept).toBe(false);
    });
  });
});
