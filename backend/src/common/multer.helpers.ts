import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export const annonceDestination = (_req: any, _file: any, cb: (err: any, dest: string) => void) => {
  const uploadPath = path.resolve(process.cwd(), 'uploads/annonces');
  fs.mkdirSync(uploadPath, { recursive: true });
  cb(null, uploadPath);
};

export const annonceFilename = (_req: any, file: any, cb: (err: any, name: string) => void) => {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
  cb(null, `${Date.now()}-${safeName}`);
};

export const annonceFileFilter = (_req: any, file: any, cb: (err: any, accept: boolean) => void) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new BadRequestException('Format image non autorisé.'), false);
  }
  cb(null, true);
};

export const annonceMixedFileFilter = (_req: any, file: any, cb: (err: any, accept: boolean) => void) => {
  const imageAllowed = ['image/png', 'image/jpeg', 'image/webp'];
  const documentAllowed = ['application/pdf', ...imageAllowed];

  if (file.fieldname === 'images') {
    if (!imageAllowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Format image non autorisé.'), false);
    }
    return cb(null, true);
  }

  if (file.fieldname === 'documents') {
    if (!documentAllowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Format document non autorisé.'), false);
    }
    return cb(null, true);
  }

  return cb(new BadRequestException('Champ fichier non autorisé.'), false);
};

export const entrepriseDestination = (_req: any, _file: any, cb: (err: any, dest: string) => void) => {
  const uploadPath = path.resolve(process.cwd(), 'uploads/entreprise');
  fs.mkdirSync(uploadPath, { recursive: true });
  cb(null, uploadPath);
};

export const entrepriseFilename = (_req: any, file: any, cb: (err: any, name: string) => void) => {
  const safeName = file.originalname.replace(/\s+/g, '-');
  cb(null, `${Date.now()}-${safeName}`);
};

export const entrepriseFileFilter = (_req: any, file: any, cb: (err: any, accept: boolean) => void) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new BadRequestException('Format non autorisé.'), false);
  }
  cb(null, true);
};
