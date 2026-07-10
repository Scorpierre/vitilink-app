import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AnnonceStatus, DocumentStatus, DocumentType, OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

@Injectable()
export class AnnonceService {
  constructor(private readonly prisma: PrismaService) {}

  async listMarketplace(filters: { q?: string; region?: string; productType?: string }) {
    const annonces = await this.prisma.annonce.findMany({
      where: {
        status: { not: AnnonceStatus.ARCHIVED },
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
          select: annonceEntrepriseSelect,
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        orders: {
          where: { status: { in: activeOrderStatuses } },
          select: { status: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return annonces.map(withPurchaseStateWithoutOrders);
  }

  async listMine(userId: string) {
    if (!userId) throw new UnauthorizedException('Non authentifié.');
    const annonces = await this.prisma.annonce.findMany({
      where: { creatorUserId: userId },
      include: {
        entreprise: {
          select: annonceEntrepriseSelect,
        },
        orders: {
          where: { status: { in: activeOrderStatuses } },
          select: { status: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return annonces.map(withPurchaseStateWithoutOrders);
  }

  async findOne(id: string, userId?: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
      include: {
        entreprise: {
          select: annonceEntrepriseSelect,
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
        documents: {
          orderBy: { createdAt: 'desc' as const },
        },
      },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable.');
    }

    // Flag fiable : l'annonce est vendue si elle a une commande payée
    // (un acheteur ne voit pas les commandes des autres, donc on l'expose côté serveur).
    const [pendingCount, paidCount, paidByCurrentUserCount] = await Promise.all([
      this.prisma.order.count({
        where: { annonceId: id, status: OrderStatus.PENDING },
      }),
      this.prisma.order.count({
        where: { annonceId: id, status: { in: paidOrderStatuses } },
      }),
      userId
        ? this.prisma.order.count({
            where: { annonceId: id, buyerUserId: userId, status: { in: paidOrderStatuses } },
          })
        : Promise.resolve(0),
    ]);

    const canSeeBuyerOnlyDocuments =
      Boolean(userId) && (annonce.creatorUserId === userId || paidByCurrentUserCount > 0);
    const documents = filterVisibleAnnonceDocuments(
      (annonce as any).documents ?? [],
      canSeeBuyerOnlyDocuments,
    );

    return withPurchaseState({ ...(annonce as any), documents }, { pendingCount, paidCount });
  }

  async create(
    userId: string,
    dto: CreateAnnonceDto,
    files: any[] = [],
    documentFiles: any[] = [],
  ) {
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

    const productType = normalizeProductType(dto.productType);
    const price = parseOptionalNumber(dto.price);
    const volume = parseOptionalNumber(dto.volume);
    const vintage = parseOptionalInteger(dto.vintage);
    const certifications = normalizeList(dto.certifications);
    const location = dto.location?.trim() || [dto.city, dto.region].filter(Boolean).join(', ');
    const imageUrls = files.map((file) => `/uploads/annonces/${file.filename}`);
    const documentCreates = buildAnnonceDocumentCreates(documentFiles, dto);

    if (!imageUrls.length) {
      throw new BadRequestException('Ajoutez au moins une photo pour publier une annonce.');
    }

    return this.prisma.annonce.create({
      data: {
        title,
        productType,
        description: emptyToNull(dto.description),
        price,
        volume,
        volumeUnit: emptyToNull(dto.volumeUnit) ?? 'hl',
        vintage,
        location: emptyToNull(location),
        city: emptyToNull(dto.city),
        region: emptyToNull(dto.region),
        country: emptyToNull(dto.country) ?? 'France',
        availabilityTiming: emptyToNull(dto.availabilityTiming),
        certifications,
        images: imageUrls,
        restrictToVerified: dto.restrictToVerified === 'true',
        status: AnnonceStatus.PUBLISHED,
        creatorUserId: userId,
        entrepriseId: user.entrepriseId,
        ...(documentCreates.length
          ? { documents: { create: documentCreates as any } }
          : {}),
      },
      include: {
        entreprise: {
          select: annonceEntrepriseSelect,
        },
        documents: {
          orderBy: { createdAt: 'desc' as const },
        },
      },
    });
  }

  async updateMine(
    id: string,
    userId: string,
    dto: UpdateAnnonceDto,
    files: any[] = [],
    documentFiles: any[] = [],
  ) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
      include: { documents: true },
    });
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
    const nextImages = [...keptImages, ...uploadedImages];
    const location = dto.location?.trim() || [dto.city, dto.region].filter(Boolean).join(', ');

    if (!nextImages.length) {
      throw new BadRequestException('Ajoutez au moins une photo pour publier une annonce.');
    }

    await this.syncAnnonceDocuments(id, dto, (annonce as any).documents ?? [], documentFiles);

    return this.prisma.annonce.update({
      where: { id },
      data: {
        title,
        productType: normalizeProductType(dto.productType),
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
        images: nextImages,
        restrictToVerified: dto.restrictToVerified === 'true',
        status: AnnonceStatus.PUBLISHED,
      },
      include: {
        entreprise: {
          select: annonceEntrepriseSelect,
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' as const },
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

  private async syncAnnonceDocuments(
    annonceId: string,
    dto: UpdateAnnonceDto,
    currentDocuments: Array<{ id: string }>,
    documentFiles: any[],
  ) {
    const hasExistingDocumentPayload = dto.existingDocumentIds !== undefined;
    const hasNewDocuments = documentFiles.length > 0;

    if (!hasExistingDocumentPayload && !hasNewDocuments) {
      return;
    }

    const currentIds = currentDocuments.map((document) => document.id);
    const requestedIds = hasExistingDocumentPayload
      ? normalizeFormValues(dto.existingDocumentIds).map((id) => id.trim()).filter(Boolean)
      : currentIds;
    const keptIds = requestedIds.filter((id) => currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !keptIds.includes(id));
    const labels = normalizeFormValues(dto.existingDocumentLabels);
    const visibilities = normalizeFormValues(dto.existingDocumentVisibilities);
    const documentCreates = buildAnnonceDocumentCreates(documentFiles, dto);

    if (removedIds.length) {
      await this.prisma.document.deleteMany({
        where: { annonceId, id: { in: removedIds } },
      });
    }

    await Promise.all(
      keptIds.map((id, index) =>
        this.prisma.document.update({
          where: { id },
          data: {
            label: emptyToNull(labels[index]),
            visibility: normalizeDocumentVisibility(visibilities[index]),
          } as any,
        }),
      ),
    );

    if (documentCreates.length) {
      await this.prisma.document.createMany({
        data: documentCreates.map((document) => ({
          ...document,
          annonceId,
        })) as any,
      });
    }
  }
}

const annonceEntrepriseSelect = {
  id: true,
  name: true,
  type: true,
  status: true,
  siren: true,
  siret: true,
  vatNumber: true,
  cviNumber: true,
  addressLine1: true,
  addressLine2: true,
  postalCode: true,
  city: true,
  country: true,
  region: true,
  department: true,
  appellations: true,
  grapeVarieties: true,
  surfaceHa: true,
  annualVolume: true,
  soughtProducts: true,
  soughtVolume: true,
  verificationNote: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

const paidOrderStatuses = [
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const activeOrderStatuses = [
  OrderStatus.PENDING,
  ...paidOrderStatuses,
] as OrderStatus[];

const allowedProductTypes = [
  'Raisin',
  'Moût de raisin',
  'Jus de raisin',
] as const;

const legacyProductTypes: Record<string, (typeof allowedProductTypes)[number]> = {
  Moût: 'Moût de raisin',
  Jus: 'Jus de raisin',
};

function withPurchaseState<
  T extends {
    status: AnnonceStatus;
    orders?: Array<{ status: OrderStatus }>;
  },
>(
  annonce: T,
  counts?: { pendingCount?: number; paidCount?: number },
) {
  const hasPaid =
    Boolean(counts?.paidCount) ||
    annonce.status === AnnonceStatus.SOLD ||
    annonce.orders?.some((order) => paidOrderStatuses.includes(order.status as any));
  const hasPending =
    Boolean(counts?.pendingCount) ||
    annonce.orders?.some((order) => order.status === OrderStatus.PENDING);
  const purchaseStatus = hasPaid ? 'PAID' : hasPending ? 'IN_PROGRESS' : 'AVAILABLE';

  return {
    ...annonce,
    purchaseStatus,
    soldOut: hasPaid,
    pendingPurchase: !hasPaid && hasPending,
  };
}

function withPurchaseStateWithoutOrders<
  T extends {
    status: AnnonceStatus;
    orders?: Array<{ status: OrderStatus }>;
  },
>(annonce: T) {
  const { orders, ...rest } = withPurchaseState(annonce);
  return rest;
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeProductType(value?: string | null) {
  const trimmed = emptyToNull(value);
  if (!trimmed) return null;

  const normalized = legacyProductTypes[trimmed] ?? trimmed;
  if (!allowedProductTypes.includes(normalized as (typeof allowedProductTypes)[number])) {
    throw new BadRequestException('Type de produit invalide.');
  }

  return normalized;
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

function normalizeFormValues(value?: string[] | string) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeDocumentVisibility(value?: string | null) {
  return value === 'BUYER_ONLY' ? 'BUYER_ONLY' : 'PUBLIC';
}

function buildAnnonceDocumentCreates(files: any[], dto: CreateAnnonceDto | UpdateAnnonceDto) {
  const labels = normalizeFormValues(dto.documentLabels);
  const visibilities = normalizeFormValues(dto.documentVisibilities);

  return files.map((file, index) => {
    const originalName = emptyToNull(file.originalname) ?? file.filename;
    const label = emptyToNull(labels[index]) ?? originalName;

    return {
      url: `/uploads/annonces/${file.filename}`,
      type: DocumentType.SALE_DOC,
      status: DocumentStatus.APPROVED,
      visibility: normalizeDocumentVisibility(visibilities[index]),
      originalName,
      mimeType: emptyToNull(file.mimetype),
      sizeBytes: typeof file.size === 'number' ? file.size : null,
      label,
    };
  });
}

function filterVisibleAnnonceDocuments(
  documents: Array<{ visibility?: string | null }>,
  canSeeBuyerOnlyDocuments: boolean,
) {
  return documents.filter((document) => {
    const visibility = document.visibility ?? 'PUBLIC';
    return visibility === 'PUBLIC' || canSeeBuyerOnlyDocuments;
  });
}
