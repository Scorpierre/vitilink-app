import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => emptyStringToNull(value))
  name?: string;

  @IsOptional()
  @IsEnum(CompanyTypeDto)
  @Transform(({ value }) => emptyStringToUndefined(value))
  type?: CompanyTypeDto;

  @IsOptional()
  @Matches(/^\d{9}$/)
  @Transform(({ value }) => emptyStringToNull(value))
  siren?: string;

  @IsOptional()
  @Matches(/^\d{14}$/)
  @Transform(({ value }) => emptyStringToNull(value))
  siret?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  vatNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  cviNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  city?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  country?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
  region?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyStringToNull(value))
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
  @Transform(({ value }) => emptyStringToNull(value))
  soughtVolume?: string;
}

function emptyStringToNull(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
