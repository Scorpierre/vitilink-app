import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AnnonceStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

@Injectable()
export class AnnonceService {
  constructor(private readonly prisma: PrismaService) {}

  async listMarketplace(filters: { q?: string; region?: string; productType?: string }) {
    return this.prisma.annonce.findMany({
      where: {
        status: AnnonceStatus.PUBLISHED,
        ...(filters.region ? { region: filters.region } : {}),
        ...(filters.productType ? { productType: filters.productType } : {}),
        ...(filters.q
          ? {
              OR: [
                { title: { contains: filters.q, mode: 'insensitive' } },
                { description: { contains: filters.q, mode: 'insensitive' } },
                { city: { contains: filters.q, mode: 'insensitive' } },
                { region: { contains: filters.q, mode: 'insensitive' } },
                { productType: { contains: filters.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        entreprise: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            city: true,
            region: true,
            country: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMine(userId: string) {
    if (!userId) throw new UnauthorizedException('Non authentifié.');
    return this.prisma.annonce.findMany({
      where: { creatorUserId: userId },
      include: {
        entreprise: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            city: true,
            region: true,
            country: true,
          },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
      include: {
        entreprise: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            city: true,
            region: true,
            country: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        orders: userId
          ? {
              // Le vendeur voit toutes les commandes ; un acheteur ne voit que les siennes.
              where: { OR: [{ buyerUserId: userId }, { annonce: { creatorUserId: userId } }] },
              select: {
                id: true,
                status: true,
                quantity: true,
                totalAmount: true,
                createdAt: true,
                buyerUserId: true,
                buyer: { select: { id: true, username: true } },
              },
              orderBy: { createdAt: 'desc' as const },
            }
          : false,
      },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable.');
    }

    // Flag fiable : l'annonce est vendue si elle a une commande payée
    // (un acheteur ne voit pas les commandes des autres, donc on l'expose côté serveur).
    const paidCount = await this.prisma.order.count({
      where: { annonceId: id, status: OrderStatus.PAID },
    });

    return { ...annonce, soldOut: paidCount > 0 || annonce.status === AnnonceStatus.SOLD };
  }

  async create(userId: string, dto: CreateAnnonceDto, files: any[] = []) {
    if (!userId) throw new UnauthorizedException('Non authentifié.');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { entreprise: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (!user.entrepriseId) {
      throw new BadRequestException('Complétez votre entreprise avant de déposer une annonce.');
    }

    const title = dto.title?.trim();
    if (!title) {
      throw new BadRequestException('Le nom de l’annonce est obligatoire.');
    }

    const imageUrls = files.map((file) => `/uploads/annonces/${file.filename}`);
    const location = dto.location?.trim() || [dto.city, dto.region].filter(Boolean).join(', ');

    return this.prisma.annonce.create({
      data: {
        title,
        productType: emptyToNull(dto.productType),
        description: emptyToNull(dto.description),
        price: parseOptionalNumber(dto.price),
        volume: parseOptionalNumber(dto.volume),
        volumeUnit: emptyToNull(dto.volumeUnit) ?? 'hl',
        vintage: parseOptionalInteger(dto.vintage),
        location: emptyToNull(location),
        city: emptyToNull(dto.city),
        region: emptyToNull(dto.region),
        country: emptyToNull(dto.country) ?? 'France',
        availabilityTiming: emptyToNull(dto.availabilityTiming),
        certifications: normalizeList(dto.certifications),
        images: imageUrls,
        restrictToVerified: dto.restrictToVerified === 'true',
        status: AnnonceStatus.PUBLISHED,
        creatorUserId: userId,
        entrepriseId: user.entrepriseId,
      },
      include: {
        entreprise: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            city: true,
            region: true,
            country: true,
          },
        },
      },
    });
  }

  async updateMine(id: string, userId: string, dto: UpdateAnnonceDto, files: any[] = []) {
    const annonce = await this.prisma.annonce.findUnique({ where: { id } });
    if (!annonce) throw new NotFoundException('Annonce introuvable.');
    if (annonce.creatorUserId !== userId) throw new ForbiddenException('Accès refusé.');

    const title = dto.title?.trim();
    if (!title) {
      throw new BadRequestException('Le nom de l’annonce est obligatoire.');
    }

    const uploadedImages = files.map((file) => `/uploads/annonces/${file.filename}`);
    const requestedExistingImages =
      dto.existingImages === undefined ? annonce.images : normalizeList(dto.existingImages);
    const keptImages = requestedExistingImages.filter((path) => annonce.images.includes(path));
    const location = dto.location?.trim() || [dto.city, dto.region].filter(Boolean).join(', ');

    return this.prisma.annonce.update({
      where: { id },
      data: {
        title,
        productType: emptyToNull(dto.productType),
        description: emptyToNull(dto.description),
        price: parseOptionalNumber(dto.price),
        volume: parseOptionalNumber(dto.volume),
        volumeUnit: emptyToNull(dto.volumeUnit) ?? 'hl',
        vintage: parseOptionalInteger(dto.vintage),
        location: emptyToNull(location),
        city: emptyToNull(dto.city),
        region: emptyToNull(dto.region),
        country: emptyToNull(dto.country) ?? 'France',
        availabilityTiming: emptyToNull(dto.availabilityTiming),
        certifications: normalizeList(dto.certifications),
        images: [...keptImages, ...uploadedImages],
        restrictToVerified: dto.restrictToVerified === 'true',
        status: AnnonceStatus.PUBLISHED,
      },
      include: {
        entreprise: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            city: true,
            region: true,
            country: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async archiveMine(id: string, userId: string) {
    const annonce = await this.prisma.annonce.findUnique({ where: { id } });
    if (!annonce) throw new NotFoundException('Annonce introuvable.');
    if (annonce.creatorUserId !== userId) throw new ForbiddenException('Accès refusé.');

    return this.prisma.annonce.update({
      where: { id },
      data: { status: AnnonceStatus.ARCHIVED },
    });
  }
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseOptionalNumber(value?: string) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) throw new BadRequestException('Nombre invalide.');
  return parsed;
}

function parseOptionalInteger(value?: string) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new BadRequestException('Millésime invalide.');
  return parsed;
}

function normalizeList(value?: string[] | string) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}
