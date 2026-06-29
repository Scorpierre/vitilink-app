import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  annonceId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
