import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentWorkerService } from './document-worker.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentWorkerService,PrismaService],
  exports: [DocumentService],
})
export class DocumentModule {}