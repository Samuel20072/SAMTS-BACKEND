import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsIn, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Página Web Básica' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Diseño profesional con hasta 5 secciones, SEO básico y formulario de contacto.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://images.url/service.png', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 499.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Página Web', description: 'Página Web | Agente IA | Paquete Completo' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'unique', description: 'unique | monthly | annual', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['unique', 'monthly', 'annual'])
  priceType?: string;

  @ApiProperty({ example: ['5 secciones', 'SEO básico', 'Formulario de contacto'], required: false })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({ example: '2-4 semanas', required: false })
  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  featured?: boolean;
}
