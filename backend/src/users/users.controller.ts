import { Controller, Body, Post, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './update-user.dto';
    
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('signup')
    async signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
    }


    @UseGuards(JwtAuthGuard)
    @Get('logged')
    async getLoggedUserData(@Request() req)
    {
        const userId = req.user.userId;
        const result = await this.userService.getUserData(userId);

        return {
            status: result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            result: result.result
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    async updateUser(
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    )
    {
        const userId = req.user.userId;
        const result = await this.userService.updateUser(updateUserDto, userId);

        return {
            status: result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            message: result.message
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('privateinfos')
    async getPrivateInfos(@Request() req)
    {
        const userId = req.user.userId;
        const userInfos = await this.userService.findById(userId);

        if (!userInfos) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'User not found',
                result: null
            };
        }

        const { password, ...userData } = userInfos;

        return {
            status: HttpStatus.OK,
            message: '',
            result: userData
        };
    }
}
