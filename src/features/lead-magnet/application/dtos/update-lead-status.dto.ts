import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { LeadStatus } from '../../../../shared/enums/lead-status.enum';

export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus, required: false })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nextAction?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  convertedToClient?: boolean;

  @ApiProperty({ example: 2500000, required: false })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @ApiProperty({ example: 'Carlos Asesor', required: false })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ example: 'Propuesta Técnica Presentada', required: false })
  @IsString()
  @IsOptional()
  dealStage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  activityEntry?: {
    type: string;
    description: string;
    author?: string;
  };
}
