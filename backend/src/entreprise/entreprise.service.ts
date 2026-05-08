import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';

@Injectable()
export class EntrepriseService {
  constructor(private readonly prisma: PrismaService) {}

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
          name: dto.name || 'Mon entreprise',
          type: dto.type || 'OTHER',
          siren: dto.siren,
          siret: dto.siret,
          vatNumber: dto.vatNumber,
          cviNumber: dto.cviNumber,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          postalCode: dto.postalCode,
          city: dto.city,
          country: dto.country || 'France',
          region: dto.region,
          department: dto.department,
          appellations: dto.appellations || [],
          grapeVarieties: dto.grapeVarieties || [],
          surfaceHa: dto.surfaceHa,
          annualVolume: dto.annualVolume,
          soughtProducts: dto.soughtProducts || [],
          soughtVolume: dto.soughtVolume,
          status: 'PENDING',
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { entrepriseId: entreprise.id },
      });

      return entreprise;
    }

    return this.prisma.entreprise.update({
      where: { id: user.entrepriseId },
      data: {
        name: dto.name,
        type: dto.type,
        siren: dto.siren,
        siret: dto.siret,
        vatNumber: dto.vatNumber,
        cviNumber: dto.cviNumber,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        postalCode: dto.postalCode,
        city: dto.city,
        country: dto.country,
        region: dto.region,
        department: dto.department,
        appellations: dto.appellations,
        grapeVarieties: dto.grapeVarieties,
        surfaceHa: dto.surfaceHa,
        annualVolume: dto.annualVolume,
        soughtProducts: dto.soughtProducts,
        soughtVolume: dto.soughtVolume,
        status: 'PENDING',
        verificationNote: null,
        verifiedAt: null,
      },
    });
  }
}