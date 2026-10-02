import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ILeadMagnetRepository } from '../domain/repositories/lead-magnet.repository.interface';
import { CreateLeadMagnetLeadDto } from './dtos/create-lead-magnet-lead.dto';
import { LeadMagnetLeadResponseDto } from './dtos/lead-magnet-lead-response.dto';
import { LeadMagnetLead } from '../domain/entities/lead-magnet-lead.entity';

@Injectable()
export class LeadMagnetService {
  constructor(private readonly repository: ILeadMagnetRepository) {}

  /**
   * Creates a new lead. If the email already exists, returns the existing record
   * instead of throwing (idempotent to avoid duplicate errors on retry).
   */
  async create(dto: CreateLeadMagnetLeadDto): Promise<LeadMagnetLeadResponseDto> {
    // Prevent duplicates — return existing if email was already registered
    const existing = await this.repository.findByEmail(dto.email.toLowerCase().trim());
    if (existing) {
      return LeadMagnetLeadResponseDto.fromEntity(existing);
    }

    const lead = new LeadMagnetLead();
    lead.name = dto.name.trim();
    lead.email = dto.email.toLowerCase().trim();
    lead.whatsapp = dto.whatsapp?.trim();
    lead.businessType = dto.businessType;
    lead.hasWebsite = dto.hasWebsite;
    lead.utmSource = dto.utmSource;
    lead.utmMedium = dto.utmMedium;
    lead.utmCampaign = dto.utmCampaign;
    lead.utmContent = dto.utmContent;
    lead.utmTerm = dto.utmTerm;
    lead.source = dto.source;
    lead.landingPage = dto.landingPage;
    lead.referrer = dto.referrer;
    lead.campaign = 'lead_magnet_pdf';

    const saved = await this.repository.save(lead);
    return LeadMagnetLeadResponseDto.fromEntity(saved);
  }

  async markPdfDownloaded(id: string): Promise<void> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    lead.downloadedPdf = true;
    await this.repository.save(lead);
  }

  async markDiagnosticVisited(id: string): Promise<void> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    lead.visitedDiagnostic = true;
    await this.repository.save(lead);
  }

  async markWhatsappClicked(id: string): Promise<void> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    lead.clickedWhatsapp = true;
    await this.repository.save(lead);
  }

  async markConverted(id: string): Promise<void> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    lead.convertedToClient = true;
    await this.repository.save(lead);
  }

  async findAll(): Promise<LeadMagnetLeadResponseDto[]> {
    const leads = await this.repository.findAll();
    return leads.map((l) => LeadMagnetLeadResponseDto.fromEntity(l));
  }

  async findById(id: string): Promise<LeadMagnetLeadResponseDto> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return LeadMagnetLeadResponseDto.fromEntity(lead);
  }
}
