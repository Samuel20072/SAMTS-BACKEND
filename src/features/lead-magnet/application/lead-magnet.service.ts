import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ILeadMagnetRepository } from '../domain/repositories/lead-magnet.repository.interface';
import { CreateLeadMagnetLeadDto } from './dtos/create-lead-magnet-lead.dto';
import { LeadMagnetLeadResponseDto } from './dtos/lead-magnet-lead-response.dto';
import { UpdateLeadStatusDto } from './dtos/update-lead-status.dto';
import { LeadMagnetLead } from '../domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../shared/enums/lead-status.enum';

@Injectable()
export class LeadMagnetService {
  private readonly logger = new Logger(LeadMagnetService.name);
  private readonly MAX_FREE_SLOTS = 5;

  constructor(private readonly repository: ILeadMagnetRepository) {}

  /**
   * Registra un lead específicamente para una campaña con control de cupos y concurrencia transaccional.
   */
  async registerCampaign(dto: CreateLeadMagnetLeadDto): Promise<LeadMagnetLeadResponseDto> {
    const emailNorm = dto.email.toLowerCase().trim();
    const campaign = dto.campaign || 'lanzamiento_20_dias';

    const saved = await this.repository.registerCampaignWithLock(
      {
        email: emailNorm,
        name: dto.name.trim(),
        whatsapp: dto.whatsapp?.trim(),
        businessType: dto.businessType || 'General',
        businessName: dto.businessName?.trim(),
        solutionInterest: dto.solutionInterest || 'SAMTS Catalog',
        campaign,
        source: dto.source || 'landing_campaign',
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
      },
      this.MAX_FREE_SLOTS,
    );

    this.logger.log(
      `[CAMPAÑA] Registro exitoso: ${saved.email} | Estado: ${saved.status} | Campaña: ${saved.campaign}`
    );

    return LeadMagnetLeadResponseDto.fromEntity(saved);
  }

  async getCampaignStats(campaign: string) {
    const total = await this.repository.countByCampaign(campaign);
    const selected = await this.repository.findSelectedByCampaign(campaign);
    
    return {
      campaign,
      total,
      selected,
      remaining: Math.max(0, this.MAX_FREE_SLOTS - selected),
      waitlist: Math.max(0, total - selected),
      maxSlots: this.MAX_FREE_SLOTS
    };
  }

  /**
   * Creates or updates a commercial lead.
   * If email exists, enriches the existing record with new details instead of failing.
   */
  async create(dto: CreateLeadMagnetLeadDto): Promise<LeadMagnetLeadResponseDto> {
    const emailNorm = dto.email.toLowerCase().trim();
    let lead = await this.repository.findByEmail(emailNorm);
    const isNew = !lead;

    if (!lead) {
      lead = new LeadMagnetLead();
      lead.email = emailNorm;
      lead.status = LeadStatus.NEW;
    }

    lead.name = dto.name.trim();
    if (dto.whatsapp) lead.whatsapp = dto.whatsapp.trim();
    if (dto.businessType) lead.businessType = dto.businessType;
    if (dto.businessName) lead.businessName = dto.businessName.trim();
    if (dto.hasWebsite) lead.hasWebsite = dto.hasWebsite;
    if (dto.mainProblem) lead.mainProblem = dto.mainProblem;
    if (dto.solutionInterest) lead.solutionInterest = dto.solutionInterest;
    if (dto.budget) lead.budget = dto.budget;
    if (dto.urgency) lead.urgency = dto.urgency;
    if (dto.details) lead.details = dto.details;
    if (dto.diagnosticSessionId) lead.diagnosticSessionId = dto.diagnosticSessionId;
    if (dto.campaign) lead.campaign = dto.campaign;

    // UTM Attribution
    if (dto.utmSource) lead.utmSource = dto.utmSource;
    if (dto.utmMedium) lead.utmMedium = dto.utmMedium;
    if (dto.utmCampaign) lead.utmCampaign = dto.utmCampaign;
    if (dto.utmContent) lead.utmContent = dto.utmContent;
    if (dto.utmTerm) lead.utmTerm = dto.utmTerm;
    if (dto.source) lead.source = dto.source;
    if (dto.landingPage) lead.landingPage = dto.landingPage;
    if (dto.referrer) lead.referrer = dto.referrer;

    const saved = await this.repository.save(lead);
    
    this.logger.log(
      `[LEAD REGISTRADO] ID: ${saved.id} | Email: ${saved.email} | Nombre: ${saved.name} | Solución: ${saved.solutionInterest || 'N/A'} | Fuente: ${saved.source || 'N/A'}`
    );

    return LeadMagnetLeadResponseDto.fromEntity(saved);
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<LeadMagnetLeadResponseDto> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);

    if (dto.status !== undefined) lead.status = dto.status;
    if (dto.notes !== undefined) lead.notes = dto.notes;
    if (dto.nextAction !== undefined) lead.nextAction = dto.nextAction;
    if (dto.followUpDate !== undefined) {
      lead.followUpDate = dto.followUpDate ? new Date(dto.followUpDate) : undefined;
    }
    if (dto.convertedToClient !== undefined) lead.convertedToClient = dto.convertedToClient;
    if (dto.estimatedValue !== undefined) lead.estimatedValue = dto.estimatedValue;
    if (dto.assignedTo !== undefined) lead.assignedTo = dto.assignedTo;
    if (dto.dealStage !== undefined) lead.dealStage = dto.dealStage;

    if (dto.activityEntry) {
      const history = Array.isArray(lead.activityHistory) ? lead.activityHistory : [];
      history.unshift({
        date: new Date().toISOString(),
        type: dto.activityEntry.type || 'NOTE',
        description: dto.activityEntry.description,
        author: dto.activityEntry.author || 'Admin SAMTS',
      });
      lead.activityHistory = history;
    }

    const saved = await this.repository.save(lead);
    
    this.logger.log(
      `[LEAD STATUS ACTUALIZADO] ID: ${saved.id} | Nuevo Estado: ${saved.status} | Valor: $${saved.estimatedValue || 0} | Notas: ${saved.notes || 'Sin notas'}`
    );

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
    lead.status = LeadStatus.WON;
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

  async delete(id: string): Promise<void> {
    const lead = await this.repository.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    await this.repository.delete(id);
  }
}
