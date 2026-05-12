import { Controller, Body, Post, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateProfileDto } from './update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const user = await this.userService.findById(userId);

    if (!user) {
      return { status: HttpStatus.NOT_FOUND, message: 'User not found', result: null };
    }

    const { password, ...userData } = user;
    return { status: HttpStatus.OK, message: '', result: userData };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async updateProfile(@Body() dto: UpdateProfileDto, @Request() req) {
    const userId = req.user.userId;
    const result = await this.userService.updateProfile(dto, userId);

    return {
      status: result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message: result.message,
    };
  }
}