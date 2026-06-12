import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly ormRepository: Repository<Product>,
  ) {}

  async save(product: Product): Promise<Product> {
    return this.ormRepository.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.ormRepository.findOne({
      where: { id },
    });
  }

  async findAndCount(
    clientId: string | null,
    options: {
      search?: string;
      category?: string;
      featured?: boolean;
      activeOnly?: boolean;
      skip?: number;
      take?: number;
    },
  ): Promise<[Product[], number]> {
    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (options.activeOnly !== undefined) {
      where.isActive = options.activeOnly;
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.featured !== undefined) {
      where.featured = options.featured;
    }

    if (options.search) {
      // Search in name or description
      const searchPattern = `%${options.search}%`;
      return this.ormRepository.findAndCount({
        where: [
          { ...where, name: ILike(searchPattern) },
          { ...where, description: ILike(searchPattern) },
        ],
        skip: options.skip || 0,
        take: options.take || 10,
        order: { name: 'ASC' },
      });
    }

    return this.ormRepository.findAndCount({
      where,
      skip: options.skip || 0,
      take: options.take || 10,
      order: { name: 'ASC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
