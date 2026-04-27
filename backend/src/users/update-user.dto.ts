import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole, CompanyType } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters' })
  @MaxLength(25, { message: 'Username cannot be more than 25 characters' })
  username?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  appellations?: string[];

  @IsOptional()
  @IsArray()
  grapeVarieties?: string[];

  @IsOptional()
  @IsNumber()
  surfaceHa?: number;

  @IsOptional()
  @IsNumber()
  annualVolume?: number;

  @IsOptional()
  @IsArray()
  soughtProducts?: string[];

  @IsOptional()
  @IsString()
  soughtVolume?: string;
}
