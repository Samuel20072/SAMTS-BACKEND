import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterClientDto {
  @ApiProperty({
    description: 'Business name of the new client',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'Type/Sector of the business',
    example: 'Retail',
  })
  @IsString()
  @IsNotEmpty()
  businessType: string;

  @ApiProperty({
    description: 'Contact or business email address',
    example: 'info@acme.com',
  })
  @IsEmail()
  businessEmail: string;

  @ApiProperty({
    description: 'Administrator full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({
    description: 'Administrator login email',
    example: 'john.doe@acme.com',
  })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({
    description: 'Administrator login password (minimum 6 characters)',
    example: 'Secret123!',
  })
  @IsString()
  @MinLength(6)
  adminPassword: string;

  @ApiProperty({
    description: 'WhatsApp contact number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;
}
