import { ApiProperty } from '@nestjs/swagger';
import { AISettings } from '../../domain/entities/ai-settings.entity';

export class AISettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  businessTone: string;

  @ApiProperty()
  targetAudience: string;

  @ApiProperty()
  businessObjective: string;

  @ApiProperty()
  keywords?: string;

  @ApiProperty()
  postingFrequency: string;

  @ApiProperty()
  autoGenerateBlogs: boolean;

  @ApiProperty()
  autoGeneratePromotions: boolean;

  @ApiProperty()
  autoGenerateSeo: boolean;

  @ApiProperty()
  autoGenerateWhatsappMessages: boolean;

  @ApiProperty()
  isActive: boolean;

  static fromEntity(settings: AISettings): AISettingsResponseDto {
    const dto = new AISettingsResponseDto();
    dto.id = settings.id;
    dto.clientId = settings.clientId;
    dto.businessTone = settings.businessTone;
    dto.targetAudience = settings.targetAudience;
    dto.businessObjective = settings.businessObjective;
    dto.keywords = settings.keywords;
    dto.postingFrequency = settings.postingFrequency;
    dto.autoGenerateBlogs = settings.autoGenerateBlogs;
    dto.autoGeneratePromotions = settings.autoGeneratePromotions;
    dto.autoGenerateSeo = settings.autoGenerateSeo;
    dto.autoGenerateWhatsappMessages = settings.autoGenerateWhatsappMessages;
    dto.isActive = settings.isActive;
    return dto;
  }
}
