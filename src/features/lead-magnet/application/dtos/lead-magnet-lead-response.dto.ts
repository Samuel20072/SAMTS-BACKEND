import { ApiProperty } from '@nestjs/swagger';
import { LeadMagnetLead } from '../../domain/entities/lead-magnet-lead.entity';

export class LeadMagnetLeadResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() whatsapp?: string;
  @ApiProperty() businessType: string;
  @ApiProperty() hasWebsite?: string;
  @ApiProperty() utmSource?: string;
  @ApiProperty() utmMedium?: string;
  @ApiProperty() utmCampaign?: string;
  @ApiProperty() utmContent?: string;
  @ApiProperty() utmTerm?: string;
  @ApiProperty() source?: string;
  @ApiProperty() landingPage?: string;
  @ApiProperty() campaign: string;
  @ApiProperty() downloadedPdf: boolean;
  @ApiProperty() visitedDiagnostic: boolean;
  @ApiProperty() clickedWhatsapp: boolean;
  @ApiProperty() convertedToClient: boolean;
  @ApiProperty() createdAt: Date;

  static fromEntity(entity: LeadMagnetLead): LeadMagnetLeadResponseDto {
    const dto = new LeadMagnetLeadResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.whatsapp = entity.whatsapp;
    dto.businessType = entity.businessType;
    dto.hasWebsite = entity.hasWebsite;
    dto.utmSource = entity.utmSource;
    dto.utmMedium = entity.utmMedium;
    dto.utmCampaign = entity.utmCampaign;
    dto.utmContent = entity.utmContent;
    dto.utmTerm = entity.utmTerm;
    dto.source = entity.source;
    dto.landingPage = entity.landingPage;
    dto.campaign = entity.campaign;
    dto.downloadedPdf = entity.downloadedPdf;
    dto.visitedDiagnostic = entity.visitedDiagnostic;
    dto.clickedWhatsapp = entity.clickedWhatsapp;
    dto.convertedToClient = entity.convertedToClient;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
