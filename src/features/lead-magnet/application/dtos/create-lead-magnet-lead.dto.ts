import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLeadMagnetLeadDto {
  @ApiProperty({ example: 'María García' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'maria@ejemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+573001234567', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(25)
  whatsapp?: string;

  @ApiProperty({ example: 'Tienda online', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  businessType?: string;

  @ApiProperty({ example: 'Boutique Elegance', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  businessName?: string;

  @ApiProperty({
    example: 'Sí',
    required: false,
    description: '¿Ya tienes página web? Sí / No / Tengo una pero quiero mejorarla',
  })
  @IsString()
  @IsOptional()
  hasWebsite?: string;

  @ApiProperty({ example: 'Necesito captar más clientes y vender en línea', required: false })
  @IsString()
  @IsOptional()
  mainProblem?: string;

  @ApiProperty({ example: 'Sitio Web Profesional', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  solutionInterest?: string;

  @ApiProperty({ example: '$2.500.000 COP', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  budget?: string;

  @ApiProperty({ example: 'Inmediata (1-2 semanas)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  urgency?: string;

  @ApiProperty({ example: 'Requiero catálogo con pasarela y panel administrativo', required: false })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  diagnosticSessionId?: string;

  @ApiProperty({ example: 'lead_magnet_pdf', required: false })
  @IsString()
  @IsOptional()
  campaign?: string;

  // UTM Attribution
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmSource?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmMedium?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmContent?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmTerm?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  landingPage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  referrer?: string;
}
