import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CompanyTypeDto {
  EARL = 'EARL',
  GAEC = 'GAEC',
  SAS = 'SAS',
  SARL = 'SARL',
  COOPERATIVE = 'COOPERATIVE',
  NEGOCE = 'NEGOCE',
  OTHER = 'OTHER',
}

export class UpdateEntrepriseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CompanyTypeDto)
  type?: CompanyTypeDto;

  @IsOptional()
  @Matches(/^\d{9}$/)
  siren?: string;

  @IsOptional()
  @Matches(/^\d{14}$/)
  siret?: string;

  @IsOptional()
  @IsString()
  vatNumber?: string;

  @IsOptional()
  @IsString()
  cviNumber?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

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
  @Type(() => Number)
  @IsNumber()
  surfaceHa?: number;

  @IsOptional()
  @Type(() => Number)
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