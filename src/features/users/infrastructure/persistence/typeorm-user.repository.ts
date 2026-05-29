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

  async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOne({
      where: { email },
    });
  }

  async findAll(): Promise<User[]> {
    return this.ormRepository.find();
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
