import { Injectable, NotFoundException } from '@nestjs/common';
import { Entreprise, Document } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';

type EntrepriseWithDocuments = Entreprise & {
  documents: Document[];
};

@Injectable()
export class EntrepriseService {
  constructor(private readonly prisma: PrismaService) {}

  private canBeVerified(entreprise: EntrepriseWithDocuments) {
    const hasLegalDocument = entreprise.documents.some(
      (doc) =>
        ['KBIS', 'SIRENE_NOTICE'].includes(doc.type) &&
        doc.status === 'APPROVED',
    );

    const hasCvi = entreprise.documents.some(
      (doc) => doc.type === 'CVI_CERTIFICATE' && doc.status === 'APPROVED',
    );

    return Boolean(
      (entreprise.siren || entreprise.siret) &&
        hasLegalDocument &&
        hasCvi,
    );
  }

  private async refreshVerificationStatus(entrepriseId: string) {
    const entreprise = await this.prisma.entreprise.findUnique({
      where: { id: entrepriseId },
      include: { documents: true },
    });

    if (!entreprise) {
      throw new NotFoundException('Entreprise introuvable.');
    }

    const shouldBeVerified = this.canBeVerified(entreprise);

    return this.prisma.entreprise.update({
      where: { id: entrepriseId },
      data: {
        status: shouldBeVerified ? 'VERIFIED' : 'PENDING',
        verifiedAt: shouldBeVerified ? new Date() : null,
        verificationNote: shouldBeVerified ? null : entreprise.verificationNote,
      },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        entreprise: {
          include: {
            documents: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user.entreprise;
  }

  async updateMine(userId: string, dto: UpdateEntrepriseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { entreprise: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (!user.entrepriseId) {
      const entreprise = await this.prisma.entreprise.create({
        data: {
          name: requiredString(dto.name, 'Mon entreprise'),
          type: dto.type || 'OTHER',
          siren: nullableString(dto.siren),
          siret: nullableString(dto.siret),
          vatNumber: nullableString(dto.vatNumber),
          cviNumber: nullableString(dto.cviNumber),
          addressLine1: nullableString(dto.addressLine1),
          addressLine2: nullableString(dto.addressLine2),
          postalCode: nullableString(dto.postalCode),
          city: nullableString(dto.city),
          country: nullableString(dto.country) || 'France',
          region: nullableString(dto.region),
          department: nullableString(dto.department),
          appellations: dto.appellations || [],
          grapeVarieties: dto.grapeVarieties || [],
          surfaceHa: nullableNumber(dto.surfaceHa),
          annualVolume: nullableNumber(dto.annualVolume),
          soughtProducts: dto.soughtProducts || [],
          soughtVolume: nullableString(dto.soughtVolume),
          status: 'PENDING',
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { entrepriseId: entreprise.id },
      });

      return this.refreshVerificationStatus(entreprise.id);
    }

    if (!user.entreprise) {
      throw new NotFoundException('Entreprise introuvable.');
    }

    const entreprise = await this.prisma.entreprise.update({
      where: { id: user.entrepriseId },
      data: {
        name: requiredString(dto.name, user.entreprise.name),
        type: dto.type || user.entreprise.type,
        siren: nullableString(dto.siren),
        siret: nullableString(dto.siret),
        vatNumber: nullableString(dto.vatNumber),
        cviNumber: nullableString(dto.cviNumber),
        addressLine1: nullableString(dto.addressLine1),
        addressLine2: nullableString(dto.addressLine2),
        postalCode: nullableString(dto.postalCode),
        city: nullableString(dto.city),
        country: nullableString(dto.country),
        region: nullableString(dto.region),
        department: nullableString(dto.department),
        appellations: dto.appellations || [],
        grapeVarieties: dto.grapeVarieties || [],
        surfaceHa: nullableNumber(dto.surfaceHa),
        annualVolume: nullableNumber(dto.annualVolume),
        soughtProducts: dto.soughtProducts || [],
        soughtVolume: nullableString(dto.soughtVolume),
        status: 'PENDING',
        verificationNote: null,
        verifiedAt: null,
      },
    });

    return this.refreshVerificationStatus(entreprise.id);
  }
}

function requiredString(value: string | null | undefined, fallback: string) {
  const cleaned = nullableString(value);
  return cleaned || fallback;
}

function nullableString(value: string | null | undefined) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nullableNumber(value: number | null | undefined) {
  if (value === undefined || value === null) return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}
