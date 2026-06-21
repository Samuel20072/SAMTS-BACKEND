import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty({ description: 'Tipo de negocio', example: 'Restaurante' })
  @IsString()
  @MinLength(2)
  businessType: string;

  @ApiProperty({ description: 'Nombre del negocio', example: 'La Trattoria de Marco' })
  @IsString()
  @MinLength(2)
  businessName: string;

  @ApiProperty({ description: 'Ciudad donde opera el negocio', example: 'Ciudad de México' })
  @IsString()
  @MinLength(2)
  city: string;

  @ApiProperty({
    description: 'Objetivo de marketing',
    example: 'Aumentar ventas del fin de semana',
  })
  @IsString()
  @MinLength(5)
  marketingGoal: string;

  @ApiProperty({
    description: 'Tono de comunicación',
    example: 'Profesional',
    enum: ['Profesional', 'Casual', 'Divertido', 'Elegante', 'Motivacional'],
  })
  @IsString()
  tone: string;

  @ApiPropertyOptional({
    description: 'Promoción activa del negocio',
    example: '20% de descuento en pedidos mayores a $300',
  })
  @IsString()
  @IsOptional()
  activePromotion?: string;

  @ApiPropertyOptional({
    description: 'Productos o servicios destacados (separados por coma)',
    example: 'Pizza Margherita, Pasta Carbonara, Tiramisú',
  })
  @IsString()
  @IsOptional()
  featuredProducts?: string;
}
