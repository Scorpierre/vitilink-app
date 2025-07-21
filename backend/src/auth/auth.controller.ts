import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto)
    {
        const { email, password } = loginDto;
        const userValidation = await this.authService.validateUser(email, password);

        if (!userValidation.success)
            return { status: 401, access_token: '', message: userValidation.message, result: userValidation.result };

        const token = await this.authService.login(userValidation.result);

        return { status: 200, ...token, message: userValidation.message, result: userValidation.result };
    }
}