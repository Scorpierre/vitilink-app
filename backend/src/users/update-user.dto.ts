import { IsEmail, MinLength, MaxLength } from "class-validator";

export class UpdateUserDto {
    @MinLength(2, { message: 'Username must be at least 2 characters' })
    @MaxLength(25, { message: 'Username cannot be more than 25 characters' })
    username: string;

    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
}