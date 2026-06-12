import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAISettingsRepository } from '../../domain/repositories/ai-settings.repository.interface';
import { AISettings } from '../../domain/entities/ai-settings.entity';

@Injectable()
export class TypeOrmAISettingsRepository implements IAISettingsRepository {
  constructor(
    @InjectRepository(AISettings)
    private readonly ormRepository: Repository<AISettings>,
  ) {}

  async save(aiSettings: AISettings): Promise<AISettings> {
    return this.ormRepository.save(aiSettings);
  }

  async findByClientId(clientId: string): Promise<AISettings | null> {
    return this.ormRepository.findOne({
      where: { clientId },
    });
  }
}
