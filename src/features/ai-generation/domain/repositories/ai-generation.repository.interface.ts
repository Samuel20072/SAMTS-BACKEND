import { AiGeneration } from '../entities/ai-generation.entity';

export abstract class IAiGenerationRepository {
  abstract save(aiGeneration: AiGeneration): Promise<AiGeneration>;
  abstract findById(id: string): Promise<AiGeneration | null>;
  abstract findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number },
  ): Promise<[AiGeneration[], number]>;
}
