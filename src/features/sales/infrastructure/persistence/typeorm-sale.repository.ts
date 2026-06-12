import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISaleRepository } from '../../domain/repositories/sale.repository.interface';
import { Sale } from '../../domain/entities/sale.entity';

@Injectable()
export class TypeOrmSaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(Sale)
    private readonly ormRepository: Repository<Sale>,
  ) {}

  async save(sale: Sale): Promise<Sale> {
    return this.ormRepository.save(sale);
  }

  async findById(id: string): Promise<Sale | null> {
    return this.ormRepository.findOne({
      where: { id },
      relations: {
        details: {
          product: true,
        },
      },
    });
  }

  async findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number },
  ): Promise<[Sale[], number]> {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }

    return this.ormRepository.findAndCount({
      where,
      relations: {
        details: true,
      },
      skip: options.skip || 0,
      take: options.take || 10,
      order: { createdAt: 'DESC' },
    });
  }
}
