import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Descuento Especial Desarrollo Web' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Obtén 20% de descuento en tu nueva tienda digital' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://images.url/banner.png', required: false })
  @IsString()
  @IsOptional()
  bannerImage?: string;

  @ApiProperty({ example: 'PROMO20', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 20, required: false })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-30T23:59:59.000Z' })
  @IsDateString()
  endDate: string;
}
