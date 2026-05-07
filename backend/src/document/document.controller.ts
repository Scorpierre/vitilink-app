import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';

@Controller('document')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('entreprise')
  async listEntrepriseDocuments(@Request() req) {
    const userId = req.user.userId;
    const result = await this.documentService.listEntrepriseDocuments(userId);

    return {
      status: HttpStatus.OK,
      message: '',
      result,
    };
  }

  @Post('entreprise/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = path.resolve(process.cwd(), 'uploads/entreprise');
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const safeName = file.originalname.replace(/\s+/g, '-');
          cb(null, `${Date.now()}-${safeName}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/webp',
        ];

        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Format non autorisé.'), false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadEntrepriseDocument(
    @UploadedFile() file: any,
    @Body('type') type: string,
    @Body('label') label: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier manquant.');
    }

    if (!type) {
      throw new BadRequestException('Type de document manquant.');
    }

    const result = await this.documentService.uploadEntrepriseDocument({
      userId: req.user.userId,
      type,
      label,
      file,
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Document ajouté.',
      result,
    };
  }

  @Post(':id/delete')
  async deleteDocument(@Param('id') id: string, @Request() req) {
    const result = await this.documentService.deleteDocument(id, req.user.userId);

    return {
      status: HttpStatus.OK,
      message: result.message,
    };
  }
}