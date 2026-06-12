import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Summer Special Sale' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Get 20% off all electronics!' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://images.url/banner.png', required: false })
  @IsString()
  @IsOptional()
  bannerImage?: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-30T23:59:59.000Z' })
  @IsDateString()
  endDate: string;
}
