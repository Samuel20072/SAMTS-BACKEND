import { Injectable, NotFoundException } from '@nestjs/common';
import { IAISettingsRepository } from '../domain/repositories/ai-settings.repository.interface';
import { UpdateAISettingsDto } from './dtos/update-ai-settings.dto';
import { AISettingsResponseDto } from './dtos/ai-settings-response.dto';
import { AISettings } from '../domain/entities/ai-settings.entity';

@Injectable()
export class AISettingsService {
  constructor(private readonly aiSettingsRepository: IAISettingsRepository) {}

  async findByClientId(clientId: string): Promise<AISettingsResponseDto> {
    let settings = await this.aiSettingsRepository.findByClientId(clientId);
    if (!settings) {
      // Dynamic initialization if not found
      settings = new AISettings();
      settings.clientId = clientId;
      settings.businessTone = 'Professional';
      settings.targetAudience = 'General Public';
      settings.businessObjective = 'Growth';
      settings.postingFrequency = 'WEEKLY';
      settings.isActive = true;
      settings = await this.aiSettingsRepository.save(settings);
    }
    return AISettingsResponseDto.fromEntity(settings);
  }

  async update(clientId: string, dto: UpdateAISettingsDto): Promise<AISettingsResponseDto> {
    let settings = await this.aiSettingsRepository.findByClientId(clientId);
    if (!settings) {
      settings = new AISettings();
      settings.clientId = clientId;
    }

    Object.assign(settings, dto);
    const saved = await this.aiSettingsRepository.save(settings);
    return AISettingsResponseDto.fromEntity(saved);
  }
}
