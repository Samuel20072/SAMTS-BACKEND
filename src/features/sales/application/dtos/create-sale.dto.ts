import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
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
