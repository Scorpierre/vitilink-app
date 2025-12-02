import { Controller, Post, Body, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);

    const token = await this.authService.login(user);

    res.cookie('token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Successfully logged in',
      result: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  }


  @Get('me')
  async me(@Req() req: Request, @Res() res: Response) {
    const token = (req as any).cookies['token'];

    if (!token) {
      return res.status(401).json({ message: 'Not logged in', result: null });
    }

    try {
      const user = await this.authService.verifyToken(token);
      return res.status(200).json({
        message: 'User fetched',
        result: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token', result: null });
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out' });
  }
}
