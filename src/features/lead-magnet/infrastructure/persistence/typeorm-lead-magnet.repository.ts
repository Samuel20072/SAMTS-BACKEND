import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILeadMagnetRepository } from '../../domain/repositories/lead-magnet.repository.interface';
import { LeadMagnetLead } from '../../domain/entities/lead-magnet-lead.entity';

@Injectable()
export class TypeOrmLeadMagnetRepository implements ILeadMagnetRepository {
  constructor(
    @InjectRepository(LeadMagnetLead)
    private readonly ormRepository: Repository<LeadMagnetLead>,
  ) {}

  async save(lead: LeadMagnetLead): Promise<LeadMagnetLead> {
    return this.ormRepository.save(lead);
  }

  async findById(id: string): Promise<LeadMagnetLead | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<LeadMagnetLead | null> {
    return this.ormRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<LeadMagnetLead[]> {
    return this.ormRepository.find({ order: { createdAt: 'DESC' } });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
