import { AISettings } from '../entities/ai-settings.entity';

export abstract class IAISettingsRepository {
  abstract save(aiSettings: AISettings): Promise<AISettings>;
  abstract findByClientId(clientId: string): Promise<AISettings | null>;
}
