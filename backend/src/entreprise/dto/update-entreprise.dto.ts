import { IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { CompanyType } from '@prisma/client';

export class UpdateEntrepriseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appellations?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grapeVarieties?: string[];

  @IsOptional()
  @IsNumber()
  surfaceHa?: number;

  @IsOptional()
  @IsNumber()
  annualVolume?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  soughtProducts?: string[];

  @IsOptional()
  @IsString()
  soughtVolume?: string;
}

