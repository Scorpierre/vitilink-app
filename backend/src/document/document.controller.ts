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
import {
  entrepriseDestination,
  entrepriseFilename,
  entrepriseFileFilter,
} from 'src/common/multer.helpers';

const entrepriseStorage = diskStorage({ destination: entrepriseDestination, filename: entrepriseFilename });

const entrepriseInterceptor = FileInterceptor('file', {
  storage: entrepriseStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: entrepriseFileFilter,
});

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
  @UseInterceptors(entrepriseInterceptor)
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
