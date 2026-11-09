import { LeadMagnetLead } from '../entities/lead-magnet-lead.entity';

export abstract class ILeadMagnetRepository {
  abstract save(lead: LeadMagnetLead): Promise<LeadMagnetLead>;
  abstract findById(id: string): Promise<LeadMagnetLead | null>;
  abstract findByEmail(email: string): Promise<LeadMagnetLead | null>;
  abstract findByWhatsappAndCampaign(whatsapp: string, campaign: string): Promise<LeadMagnetLead | null>;
  abstract findAll(): Promise<LeadMagnetLead[]>;
  abstract delete(id: string): Promise<void>;
  abstract countByCampaign(campaign: string): Promise<number>;
  abstract findSelectedByCampaign(campaign: string): Promise<number>;
  abstract registerCampaignWithLock(
    lead: Partial<LeadMagnetLead>,
    maxSlots: number,
  ): Promise<LeadMagnetLead>;
}
