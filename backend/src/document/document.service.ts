import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Express } from 'express';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async listEntrepriseDocuments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { entrepriseId: true },
    });

    if (!user?.entrepriseId) {
      return [];
    }

    return this.prisma.document.findMany({
      where: { entrepriseId: user.entrepriseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async uploadEntrepriseDocument(params: {
    userId: string;
    type: string;
    label?: string;
    file: any;
  }) {
    const entrepriseId = await this.ensureEntreprise(params.userId);

    const url = `/uploads/entreprise/${params.file.filename}`;

    const document = await this.prisma.document.create({
      data: {
        url,
        type: params.type as any,
        status: 'PENDING',
        originalName: params.file.originalname,
        mimeType: params.file.mimetype,
        sizeBytes: params.file.size,
        label: params.label,
        entrepriseId,
      },
    });

    await this.prisma.entreprise.update({
      where: { id: entrepriseId },
      data: {
        status: 'PENDING',
        verificationNote: null,
        verifiedAt: null,
      },
    });

    return document;
  }

  private async ensureEntreprise(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, entrepriseId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.entrepriseId) {
      return user.entrepriseId;
    }

    const entreprise = await this.prisma.entreprise.create({
      data: {
        name: user.username ? `Entreprise ${user.username}` : 'Mon entreprise',
        type: 'OTHER',
        country: 'France',
        appellations: [],
        grapeVarieties: [],
        soughtProducts: [],
        status: 'PENDING',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { entrepriseId: entreprise.id },
    });

    return entreprise.id;
  }

  async deleteDocument(documentId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { entrepriseId: true },
    });

    if (!user?.entrepriseId) {
      throw new NotFoundException("Aucune entreprise liée à l'utilisateur.");
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable.');
    }

    if (document.entrepriseId !== user.entrepriseId) {
      throw new ForbiddenException('Accès refusé.');
    }

    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return {
      success: true,
      message: 'Document supprimé.',
    };
  }
}
