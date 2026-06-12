import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPromotionRepository } from '../../domain/repositories/promotion.repository.interface';
import { Promotion } from '../../domain/entities/promotion.entity';

@Injectable()
export class TypeOrmPromotionRepository implements IPromotionRepository {
  constructor(
    @InjectRepository(Promotion)
    private readonly ormRepository: Repository<Promotion>,
  ) {}

  async save(promotion: Promotion): Promise<Promotion> {
    return this.ormRepository.save(promotion);
  }

  async findById(id: string): Promise<Promotion | null> {
    return this.ormRepository.findOne({
      where: { id },
    });
  }

  async findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number; activeOnly?: boolean },
  ): Promise<[Promotion[], number]> {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }
    if (options.activeOnly !== undefined) {
      where.isActive = options.activeOnly;
    }

    return this.ormRepository.findAndCount({
      where,
      skip: options.skip || 0,
      take: options.take || 10,
      order: { startDate: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
