import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './update-user.dto';
import { CreateUserDto } from './create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new BadRequestException("Ce nom d'utilisateur est déjà utilisé.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        role: 'BUYER',
      },
    });

    const { password, ...userData } = user;
    return {
      status: 201,
      message: 'Compte créé avec succès.',
      result: userData,
    };
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
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
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        entreprise: true,
      },
    });
  }

  async updateProfile(dto: UpdateProfileDto, userId: string) {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new BadRequestException("Ce nom d'utilisateur est déjà utilisé.");
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    

    return {
      success: true,
      message: 'Profil utilisateur mis à jour.',
    };
  }
}