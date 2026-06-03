import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AISettings } from './domain/entities/ai-settings.entity';
import { IAISettingsRepository } from './domain/repositories/ai-settings.repository.interface';
import { TypeOrmAISettingsRepository } from './infrastructure/persistence/typeorm-ai-settings.repository';
import { AISettingsService } from './application/ai-settings.service';
import { AISettingsController } from './infrastructure/controllers/ai-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AISettings])],
  controllers: [AISettingsController],
  providers: [
    AISettingsService,
    {
      provide: IAISettingsRepository,
      useClass: TypeOrmAISettingsRepository,
    },
  ],
  exports: [AISettingsService, IAISettingsRepository],
})
export class AISettingsModule {}
