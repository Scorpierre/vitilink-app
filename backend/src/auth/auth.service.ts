import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { UserService } from 'src/users/users.service';
import { LoginDto } from './login.dto';
import { validate } from 'class-validator';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, password: string): Promise<{ success: boolean, message: string, result: any }> {
        const loginDto = plainToInstance(LoginDto, { email, password });
        const errors = await validate(loginDto);

        if (errors.length > 0) {
            const firstError = errors
                .map(error => error.constraints)
                .filter(constraints => constraints)
                .flatMap(constraints => constraints ? Object.values(constraints) : [])
                .shift();

                return { success: false, message: firstError ?? "Unknown error", result: null };
        }

        const user = await this.userService.findOneByEmail(email);;

        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;

            return { success: true, message: 'Successfully logged in', result: result };
        }

        return { success: false, message: 'Invalid email or password', result: null };
    }

    async login(user: any): Promise<{ access_token: string }> {
        const payload = { username: user.username, sub: user.id };

        return { access_token: this.jwtService.sign(payload) };
    }
}
