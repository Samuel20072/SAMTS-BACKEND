import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAISettingsDto {
  @ApiProperty({ example: 'Vibrant and energetic', required: false })
  @IsString()
  @IsOptional()
  businessTone?: string;

  @ApiProperty({ example: 'Tech-savvy youngsters aged 18-25', required: false })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiProperty({ example: 'Increase sales by 15%', required: false })
  @IsString()
  @IsOptional()
  businessObjective?: string;

  @ApiProperty({ example: 'gadgets, headphones, sound quality', required: false })
  @IsString()
  @IsOptional()
  keywords?: string;

  @ApiProperty({ example: 'DAILY', required: false })
  @IsString()
  @IsOptional()
  postingFrequency?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  autoGenerateBlogs?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  autoGeneratePromotions?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  autoGenerateSeo?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  autoGenerateWhatsappMessages?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
