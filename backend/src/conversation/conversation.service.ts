import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AnnonceStatus, EntrepriseStatus } from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateConversationDto) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id: dto.annonceId },
    });

    if (!annonce) throw new NotFoundException('Annonce not found');

    if (annonce.creatorUserId === buyerId) {
      throw new ForbiddenException('You cannot contact yourself');
    }

    if (annonce.status !== AnnonceStatus.PUBLISHED) {
      throw new ForbiddenException('This annonce is not available');
    }

    if (annonce.restrictToVerified) {
      const buyer = await this.prisma.user.findUnique({
        where: { id: buyerId },
        include: { entreprise: true },
      });

      if (buyer?.entreprise?.status !== EntrepriseStatus.VERIFIED) {
        throw new ForbiddenException('Only verified companies can contact this seller');
      }
    }

    const existing = await this.prisma.conversation.findUnique({
      where: { annonceId_buyerId: { annonceId: dto.annonceId, buyerId } },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        annonceId: dto.annonceId,
        buyerId,
      },
      include: { messages: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { annonce: { creatorUserId: userId } },
        ],
      },
      include: {
        annonce: { select: { id: true, title: true, entrepriseId: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        annonce: { select: { id: true, title: true, creatorUserId: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant =
      conversation.buyerId === userId ||
      conversation.annonce.creatorUserId === userId;

    if (!isParticipant) throw new ForbiddenException('Access denied');

    return conversation;
  }
}
