import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';

@Injectable()
export class TypeOrmClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(Client)
    private readonly ormRepository: Repository<Client>,
  ) {}

  async save(client: Client): Promise<Client> {
    return this.ormRepository.save(client);
  }

  async findById(id: string): Promise<Client | null> {
    return this.ormRepository.findOne({
      where: { id },
      relations: { aiSettings: true },
    });
  }

  async findAll(): Promise<Client[]> {
    return this.ormRepository.find();
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
