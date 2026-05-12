import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnnonceController } from './annonce.controller';
import { AnnonceService } from './annonce.service';

@Module({
  controllers: [AnnonceController],
  providers: [AnnonceService, PrismaService],
})
export class AnnonceModule {}
