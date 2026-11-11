import { AISettings } from '../entities/ai-settings.entity';

export abstract class IAISettingsRepository {
  abstract save(aiSettings: AISettings): Promise<AISettings>;
  abstract findByClientId(clientId: string | null): Promise<AISettings | null>;
}
