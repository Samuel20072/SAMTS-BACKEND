import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'Retail' })
  @IsString()
  @IsNotEmpty()
  businessType: string;

  @ApiProperty({ example: 'Wholesale retail shop', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://logo.url/logo.png', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ example: 'https://acme.com', required: false })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({ example: '#ffffff', required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: '#000000', required: false })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({ example: '+123456789', required: false })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ example: 'contact@acme.com' })
  @IsEmail()
  email: string;
}
