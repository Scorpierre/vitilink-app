import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(senderId: string, conversationId: string, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { annonce: { select: { creatorUserId: true } } },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant =
      conversation.buyerId === senderId ||
      conversation.annonce.creatorUserId === senderId;

    if (!isParticipant) throw new ForbiddenException('Access denied');

    const message = await this.prisma.message.create({
      data: { content, senderId, conversationId },
      include: { sender: { select: { id: true, username: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async findByConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { annonce: { select: { creatorUserId: true } } },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant =
      conversation.buyerId === userId ||
      conversation.annonce.creatorUserId === userId;

    if (!isParticipant) throw new ForbiddenException('Access denied');

    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
