import { LeadMagnetLead } from '../entities/lead-magnet-lead.entity';

export abstract class ILeadMagnetRepository {
  abstract save(lead: LeadMagnetLead): Promise<LeadMagnetLead>;
  abstract findById(id: string): Promise<LeadMagnetLead | null>;
  abstract findByEmail(email: string): Promise<LeadMagnetLead | null>;
  abstract findAll(): Promise<LeadMagnetLead[]>;
  abstract delete(id: string): Promise<void>;
}
