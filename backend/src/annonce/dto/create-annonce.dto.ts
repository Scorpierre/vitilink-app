import {
  IsBooleanString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAnnonceDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  productType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsString()
  volumeUnit?: string;

  @IsOptional()
  @IsString()
  vintage?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  availabilityTiming?: string;

  @IsOptional()
  certifications?: string[] | string;

  @IsOptional()
  existingImages?: string[] | string;

  @IsOptional()
  documentLabels?: string[] | string;

  @IsOptional()
  documentVisibilities?: string[] | string;

  @IsOptional()
  existingDocumentIds?: string[] | string;

  @IsOptional()
  existingDocumentLabels?: string[] | string;

  @IsOptional()
  existingDocumentVisibilities?: string[] | string;

  @IsOptional()
  @IsBooleanString()
  restrictToVerified?: string;
}
