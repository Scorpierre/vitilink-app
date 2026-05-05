import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

@Controller('annonces')
@UseGuards(JwtAuthGuard)
export class AnnonceController {
  constructor(private readonly annonceService: AnnonceService) {}

  @Get()
  async listMarketplace(
    @Query('q') q?: string,
    @Query('region') region?: string,
    @Query('productType') productType?: string,
  ) {
    const result = await this.annonceService.listMarketplace({ q, region, productType });
    return { status: HttpStatus.OK, message: '', result };
  }

  @Get('mine')
  async listMine(@Request() req) {
    const result = await this.annonceService.listMine(req.user.userId);
    return { status: HttpStatus.OK, message: '', result };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.annonceService.findOne(id);
    return { status: HttpStatus.OK, message: '', result };
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 8, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = path.resolve(process.cwd(), 'uploads/annonces');
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
          cb(null, `${Date.now()}-${safeName}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Format image non autorisé.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFiles() files: any[],
    @Body() dto: CreateAnnonceDto,
    @Request() req,
  ) {
    const result = await this.annonceService.create(req.user.userId, dto, files);
    return { status: HttpStatus.CREATED, message: 'Annonce publiée.', result };
  }

  @Post(':id/update')
  @UseInterceptors(
    FilesInterceptor('images', 8, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = path.resolve(process.cwd(), 'uploads/annonces');
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
          cb(null, `${Date.now()}-${safeName}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Format image non autorisé.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateMine(
    @Param('id') id: string,
    @UploadedFiles() files: any[],
    @Body() dto: UpdateAnnonceDto,
    @Request() req,
  ) {
    const result = await this.annonceService.updateMine(id, req.user.userId, dto, files);
    return { status: HttpStatus.OK, message: 'Annonce mise à jour.', result };
  }

  @Post(':id/archive')
  async archiveMine(@Param('id') id: string, @Request() req) {
    const result = await this.annonceService.archiveMine(id, req.user.userId);
    return { status: HttpStatus.OK, message: 'Annonce archivée.', result };
  }
}
