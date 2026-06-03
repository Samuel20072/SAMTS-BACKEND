import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }

  async findById(id: string, selectPassword?: boolean): Promise<User | null> {
    const query = this.ormRepository.createQueryBuilder('user').where('user.id = :id', { id });
    if (selectPassword) {
      query.addSelect('user.password');
    }
    return query.getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOne({
      where: { email },
    });
  }

  async findAll(clientId?: string | null): Promise<User[]> {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }
    return this.ormRepository.find({ where });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
