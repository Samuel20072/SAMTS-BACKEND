import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleDetailDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5db-8216b7d90d79' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({
    example: 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b',
    description:
      'Cliente (tenant) al que pertenece la venta. Obligatorio únicamente para SUPER_ADMIN; ' +
      'para usuarios de tenant se ignora y se usa el clientId del token.',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ example: 'Carlos Mendoza' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'carlos@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ type: [CreateSaleDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  details: CreateSaleDetailDto[];
}
