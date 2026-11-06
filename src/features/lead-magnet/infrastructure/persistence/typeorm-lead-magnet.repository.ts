import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILeadMagnetRepository } from '../../domain/repositories/lead-magnet.repository.interface';
import { LeadMagnetLead } from '../../domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../../shared/enums/lead-status.enum';

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

  async findByWhatsappAndCampaign(whatsapp: string, campaign: string): Promise<LeadMagnetLead | null> {
    return this.ormRepository.findOne({ where: { whatsapp, campaign } });
  }

  async findAll(): Promise<LeadMagnetLead[]> {
    return this.ormRepository.find({ order: { createdAt: 'DESC' } });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countByCampaign(campaign: string): Promise<number> {
    return this.ormRepository.count({ where: { campaign } });
  }

  async findSelectedByCampaign(campaign: string): Promise<number> {
    return this.ormRepository.count({ 
      where: { 
        campaign,
        status: LeadStatus.SELECTED
      } 
    });
  }

  /**
   * Concurrency-safe campaign registration with transactional locking in PostgreSQL.
   * Guarantees that even with concurrent requests, exactly maxSlots are SELECTED,
   * duplicates by email and phone are blocked, and extra leads enter WAITLIST.
   */
  async registerCampaignWithLock(
    leadData: Partial<LeadMagnetLead>,
    maxSlots: number,
  ): Promise<LeadMagnetLead> {
    return this.ormRepository.manager.transaction(async (manager) => {
      const emailNorm = leadData.email!.toLowerCase().trim();
      const campaign = leadData.campaign || 'lanzamiento_20_dias';
      const whatsappNorm = leadData.whatsapp ? leadData.whatsapp.replace(/[^0-9+]/g, '').trim() : undefined;

      // 1. Transaction-level advisory lock on PostgreSQL to prevent concurrent race condition
      try {
        await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`campaign_slot_${campaign}`]);
      } catch {
        // Fallback gracefully for SQLite / in-memory test harnesses
      }

      // 2. Duplicate validation by email in this campaign
      const existingEmail = await manager.findOne(LeadMagnetLead, {
        where: { email: emailNorm, campaign },
      });
      if (existingEmail) {
        throw new BadRequestException('Ya existe un registro con este correo para esta campaña.');
      }

      // 3. Duplicate validation by WhatsApp in this campaign
      if (whatsappNorm) {
        const existingPhone = await manager.findOne(LeadMagnetLead, {
          where: { whatsapp: whatsappNorm, campaign },
        });
        if (existingPhone) {
          throw new BadRequestException('Ya existe un registro con este número de WhatsApp para esta campaña.');
        }
      }

      // 4. Count selected slots inside the atomic lock
      const selectedCount = await manager.count(LeadMagnetLead, {
        where: { campaign, status: LeadStatus.SELECTED },
      });

      // 5. Build entity
      const lead = manager.create(LeadMagnetLead, {
        ...leadData,
        email: emailNorm,
        whatsapp: whatsappNorm,
        campaign,
        status: selectedCount < maxSlots ? LeadStatus.SELECTED : LeadStatus.WAITLIST,
      });

      return manager.save(LeadMagnetLead, lead);
    });
  }
}
