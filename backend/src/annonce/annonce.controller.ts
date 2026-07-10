import {
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';
import {
  annonceDestination,
  annonceFilename,
  annonceMixedFileFilter,
} from 'src/common/multer.helpers';

const annonceStorage = diskStorage({ destination: annonceDestination, filename: annonceFilename });

const annonceInterceptor = FileFieldsInterceptor([
  { name: 'images', maxCount: 8 },
  { name: 'documents', maxCount: 8 },
], {
  storage: annonceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: annonceMixedFileFilter,
});

type AnnonceUploadFields = {
  images?: any[];
  documents?: any[];
};

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
  async findOne(@Param('id') id: string, @Request() req) {
    const result = await this.annonceService.findOne(id, req.user?.userId);
    return { status: HttpStatus.OK, message: '', result };
  }

  @Post()
  @UseInterceptors(annonceInterceptor)
  async create(
    @UploadedFiles() files: AnnonceUploadFields | any[],
    @Body() dto: CreateAnnonceDto,
    @Request() req,
  ) {
    const { images, documents } = splitAnnonceFiles(files);
    const result = await this.annonceService.create(req.user.userId, dto, images, documents);
    return { status: HttpStatus.CREATED, message: 'Annonce publiée.', result };
  }

  @Post(':id/update')
  @UseInterceptors(annonceInterceptor)
  async updateMine(
    @Param('id') id: string,
    @UploadedFiles() files: AnnonceUploadFields | any[],
    @Body() dto: UpdateAnnonceDto,
    @Request() req,
  ) {
    const { images, documents } = splitAnnonceFiles(files);
    const result = await this.annonceService.updateMine(id, req.user.userId, dto, images, documents);
    return { status: HttpStatus.OK, message: 'Annonce mise à jour.', result };
  }

  @Post(':id/archive')
  async archiveMine(@Param('id') id: string, @Request() req) {
    const result = await this.annonceService.archiveMine(id, req.user.userId);
    return { status: HttpStatus.OK, message: 'Annonce archivée.', result };
  }
}

function splitAnnonceFiles(files?: AnnonceUploadFields | any[]) {
  if (Array.isArray(files)) {
    return { images: files, documents: [] };
  }

  return {
    images: files?.images ?? [],
    documents: files?.documents ?? [],
  };
}
