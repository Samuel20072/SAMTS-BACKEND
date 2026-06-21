import { Module } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { AiGenerationModule } from '../ai-generation/ai-generation.module';

@Module({
  imports: [AiGenerationModule],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
