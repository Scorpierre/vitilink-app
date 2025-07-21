import { IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from "class-validator";
import { Match } from "src/decorators/match.decorator";

export class CreateUserDto {
    @MinLength(2, { message: 'Username must be at least 2 characters' })
    @MaxLength(25, { message: 'Username cannot be more than 25 characters' })
    username: string;

    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @MinLength(2, { message: 'Password must be at least 2 characters' })
    @MaxLength(150, { message: 'Password cannot be more than 150 characters' })
    password: string;

    @Match('password', { message: 'The two passwords must be identical' })
    passwordConfirm: string;
}
