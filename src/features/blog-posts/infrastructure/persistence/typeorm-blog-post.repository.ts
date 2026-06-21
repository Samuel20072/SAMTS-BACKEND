import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBlogPostRepository } from '../../domain/repositories/blog-post.repository.interface';
import { BlogPost } from '../../domain/entities/blog-post.entity';
import { BlogStatus } from '../../../../shared/enums/blog-status.enum';

@Injectable()
export class TypeOrmBlogPostRepository implements IBlogPostRepository {
  constructor(
    @InjectRepository(BlogPost)
    private readonly ormRepository: Repository<BlogPost>,
  ) {}

  async save(blogPost: BlogPost): Promise<BlogPost> {
    return this.ormRepository.save(blogPost);
  }

  async findById(id: string): Promise<BlogPost | null> {
    return this.ormRepository.findOne({
      where: { id },
    });
  }

  async findBySlug(slug: string, clientId: string | null): Promise<BlogPost | null> {
    const where: any = { slug };
    if (clientId) {
      where.clientId = clientId;
    }
    return this.ormRepository.findOne({
      where,
    });
  }

  async findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number; status?: BlogStatus },
  ): Promise<[BlogPost[], number]> {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }
    if (options.status) {
      where.status = options.status;
    }

    return this.ormRepository.findAndCount({
      where,
      skip: options.skip || 0,
      take: options.take || 10,
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
