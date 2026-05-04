import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum UserRoleDto {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  BOTH = 'BOTH',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  username?: string;

  @IsOptional()
  @IsEnum(UserRoleDto)
  role?: UserRoleDto;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}