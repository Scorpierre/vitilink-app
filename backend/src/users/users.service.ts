import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async signup(dto: CreateUserDto) {
    const { username, email, password } = dto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new HttpException('Email or username already taken', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    return { message: 'Account successfully created' };
  }

  async updateProfile(dto: UpdateProfileDto, userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.findById(userId);
    if (!user) return { success: false, message: 'User not found' };

    try {
      const { ...data } = dto;
      await this.prisma.user.update({ where: { id: userId }, data });
      return { success: true, message: 'Profile updated successfully' };
    } catch {
      return { success: false, message: 'Failed to update profile' };
    }
  }
}
