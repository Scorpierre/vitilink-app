import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntrepriseDto } from './dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';

@Injectable()
export class EntrepriseService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEntrepriseDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.entrepriseId) throw new BadRequestException('User already has an entreprise');

    const entreprise = await this.prisma.entreprise.create({
      data: {
        ...dto,
        users: { connect: { id: userId } },
      },
    });

    return entreprise;
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { entreprise: true },
    });
    if (!user?.entreprise) throw new NotFoundException('No entreprise found for this user');
    return user.entreprise;
  }

  async update(userId: string, dto: UpdateEntrepriseDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.entrepriseId) throw new NotFoundException('No entreprise found for this user');

    return this.prisma.entreprise.update({
      where: { id: user.entrepriseId },
      data: dto,
    });
  }
}
