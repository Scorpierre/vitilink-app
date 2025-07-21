import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './update-user.dto';


@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findById(userId: string) {
        return this.prisma.user.findUnique({
          where: { id: userId },
        });
      }
    
      async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({
          where: { email },
        });
      }

      async createUser(createUserDto: CreateUserDto): Promise<{ success: boolean, message: string }> {
        const { username, email, password } = createUserDto;
        const existingUser = await this.prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        });
    
        if (existingUser) {
          return { success: false, message: 'Email or username is already taken' };
        }
    
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await this.prisma.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
            },
          });
          console.log('User created:', newUser);
          return { success: true, message: 'Account successfully created' };
        } catch (error) {
          console.error('Prisma error:', error);
          return { success: false, message: 'Internal server error' };
        }
      }

    async getUserData(userId: string): Promise<any> {
        try {
            const userData = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            if (userData) {
                return { success: true, result: userData };
            } else {
                return { success: false, result: null };
            }
        } catch (error) {
            return { success: false, result: null };
        }
    }

    async updateUser(updateUserDto: UpdateUserDto, userId: string): Promise<{ success: boolean, message: string }> {
        const user = await this.findById(userId);

        if (!user)
            return { success: false, message: 'Internal server error' };

        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    username: updateUserDto.username || user.username,
                    email: updateUserDto.email || user.email,
                },
            });

            return { success: true, message: 'Successfully updated profile informations' };
        } catch (error) {
            return { success: false, message: 'Failed to update profile informations' };
        }
    }
}
