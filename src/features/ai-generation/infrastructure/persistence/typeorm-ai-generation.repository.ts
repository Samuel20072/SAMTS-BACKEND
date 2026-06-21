import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAiGenerationRepository } from '../../domain/repositories/ai-generation.repository.interface';
import { AiGeneration } from '../../domain/entities/ai-generation.entity';

@Injectable()
export class TypeOrmAiGenerationRepository implements IAiGenerationRepository {
  constructor(
    @InjectRepository(AiGeneration)
    private readonly ormRepository: Repository<AiGeneration>,
  ) {}

  async save(aiGeneration: AiGeneration): Promise<AiGeneration> {
    return this.ormRepository.save(aiGeneration);
  }

  async findById(id: string): Promise<AiGeneration | null> {
    return this.ormRepository.findOne({
      where: { id },
    });
  }

  async findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number },
  ): Promise<[AiGeneration[], number]> {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }

    return this.ormRepository.findAndCount({
      where,
      skip: options.skip || 0,
      take: options.take || 10,
      order: { createdAt: 'DESC' },
    });
  }
}
