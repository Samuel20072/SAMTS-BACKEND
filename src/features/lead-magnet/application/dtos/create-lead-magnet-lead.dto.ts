import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
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
  @MaxLength(20)
  whatsapp?: string;

  @ApiProperty({ example: 'Tienda online' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  businessType: string;

  @ApiProperty({
    example: 'Sí',
    required: false,
    description: '¿Ya tienes página web? Sí / No / Tengo una pero quiero mejorarla',
  })
  @IsString()
  @IsOptional()
  hasWebsite?: string;

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
