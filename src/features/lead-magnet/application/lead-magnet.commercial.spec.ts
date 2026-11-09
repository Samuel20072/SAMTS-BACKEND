import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeadMagnetService } from './lead-magnet.service';
import { ILeadMagnetRepository } from '../domain/repositories/lead-magnet.repository.interface';
import { LeadMagnetLead } from '../domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../shared/enums/lead-status.enum';
import { CreateLeadMagnetLeadDto } from './dtos/create-lead-magnet-lead.dto';

/**
 * Concurrency-safe in-memory repository mimicking PostgreSQL transactional advisory lock
 */
class MockLeadMagnetRepository implements ILeadMagnetRepository {
  private leads: LeadMagnetLead[] = [];
  private lockPromise: Promise<void> = Promise.resolve();

  async save(lead: LeadMagnetLead): Promise<LeadMagnetLead> {
    if (!lead.id) {
      lead.id = 'lead_' + Math.random().toString(36).substring(2, 9);
      lead.createdAt = new Date();
      lead.updatedAt = new Date();
    }
    const idx = this.leads.findIndex((l) => l.id === lead.id);
    if (idx >= 0) {
      this.leads[idx] = lead;
    } else {
      this.leads.push(lead);
    }
    return lead;
  }

  async findById(id: string): Promise<LeadMagnetLead | null> {
    return this.leads.find((l) => l.id === id) || null;
  }

  async findByEmail(email: string): Promise<LeadMagnetLead | null> {
    return this.leads.find((l) => l.email === email) || null;
  }

  async findByWhatsappAndCampaign(whatsapp: string, campaign: string): Promise<LeadMagnetLead | null> {
    return this.leads.find((l) => l.whatsapp === whatsapp && l.campaign === campaign) || null;
  }

  async findAll(): Promise<LeadMagnetLead[]> {
    return [...this.leads];
  }

  async delete(id: string): Promise<void> {
    this.leads = this.leads.filter((l) => l.id !== id);
  }

  async countByCampaign(campaign: string): Promise<number> {
    return this.leads.filter((l) => l.campaign === campaign).length;
  }

  async findSelectedByCampaign(campaign: string): Promise<number> {
    return this.leads.filter((l) => l.campaign === campaign && l.status === LeadStatus.SELECTED).length;
  }

  /**
   * Simulates PostgreSQL transaction with pg_advisory_xact_lock
   */
  async registerCampaignWithLock(
    leadData: Partial<LeadMagnetLead>,
    maxSlots: number,
  ): Promise<LeadMagnetLead> {
    // Acquire mutex simulating advisory transaction lock
    let releaseLock!: () => void;
    const currentLock = this.lockPromise;
    this.lockPromise = new Promise((resolve) => {
      releaseLock = resolve;
    });
    await currentLock;

    try {
      // Simulate micro-latency under concurrent load
      await new Promise((r) => setTimeout(r, 10));

      const emailNorm = leadData.email!.toLowerCase().trim();
      const campaign = leadData.campaign || 'lanzamiento_20_dias';
      const whatsappNorm = leadData.whatsapp ? leadData.whatsapp.replace(/[^0-9+]/g, '').trim() : undefined;

      // 1. Check duplicate email in this campaign
      const existingEmail = this.leads.find(
        (l) => l.email === emailNorm && l.campaign === campaign,
      );
      if (existingEmail) {
        throw new BadRequestException('Ya existe un registro con este correo para esta campaña.');
      }

      // 2. Check duplicate phone in this campaign
      if (whatsappNorm) {
        const existingPhone = this.leads.find(
          (l) => l.whatsapp === whatsappNorm && l.campaign === campaign,
        );
        if (existingPhone) {
          throw new BadRequestException('Ya existe un registro con este número de WhatsApp para esta campaña.');
        }
      }

      // 3. Count selected
      const selectedCount = this.leads.filter(
        (l) => l.campaign === campaign && l.status === LeadStatus.SELECTED,
      ).length;

      const lead = new LeadMagnetLead();
      Object.assign(lead, leadData);
      lead.id = 'lead_' + Math.random().toString(36).substring(2, 9);
      lead.email = emailNorm;
      lead.whatsapp = whatsappNorm;
      lead.campaign = campaign;
      lead.status = selectedCount < maxSlots ? LeadStatus.SELECTED : LeadStatus.WAITLIST;
      lead.createdAt = new Date();
      lead.updatedAt = new Date();

      this.leads.push(lead);
      return lead;
    } finally {
      releaseLock();
    }
  }

  clear() {
    this.leads = [];
  }
}

describe('SAMTS Commercial & Lead Capture Engine (QA Comprehensive)', () => {
  let service: LeadMagnetService;
  let repository: MockLeadMagnetRepository;

  beforeEach(() => {
    repository = new MockLeadMagnetRepository();
    service = new LeadMagnetService(repository);
  });

  describe('1. Full Lead Capture Across All 4 Touchpoints', () => {
    it('1.1. Modal de propuesta comercial captures complete lead', async () => {
      const dto: CreateLeadMagnetLeadDto = {
        name: 'Carlos Mendoza',
        email: 'carlos@empresa.co',
        whatsapp: '+573101112233',
        businessType: 'Retail',
        businessName: 'Mendoza Stores',
        solutionInterest: 'Tienda Virtual',
        budget: '$3.500.000 COP',
        source: 'consultation_modal',
        campaign: 'general_contact',
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe('carlos@empresa.co');
      expect(result.name).toBe('Carlos Mendoza');
      expect(result.solutionInterest).toBe('Tienda Virtual');
      expect(result.status).toBe(LeadStatus.NEW);
      expect(result.source).toBe('consultation_modal');
    });

    it('1.2. Diagnóstico con Samuel AI persists diagnosis session and answers', async () => {
      const dto: CreateLeadMagnetLeadDto = {
        name: 'Laura Restrepo',
        email: 'laura@clinicaestetica.com',
        whatsapp: '+573159998877',
        businessType: 'Salud & Belleza',
        businessName: 'Estética Glow',
        solutionInterest: 'Sistema de Agendamiento & IA',
        budget: '$4.200.000 COP',
        diagnosticSessionId: 'diag_sess_982341',
        details: 'Respuestas Samuel: Necesita citas automáticas y pagos en línea',
        source: 'samuel_ai',
        campaign: 'samuel_diagnostic',
      };

      const result = await service.create(dto);

      expect(result.diagnosticSessionId).toBe('diag_sess_982341');
      expect(result.campaign).toBe('samuel_diagnostic');
      expect(result.source).toBe('samuel_ai');
    });

    it('1.3. Formulario de Guía Gratuita captures lead and allows PDF download tracking', async () => {
      const dto: CreateLeadMagnetLeadDto = {
        name: 'Andrés Felipe Gómez',
        email: 'andres@inversiones.com',
        whatsapp: '+573004445566',
        solutionInterest: 'Guía de Conversión Digital',
        campaign: 'lead_magnet_pdf',
        source: 'guia_landing',
      };

      const result = await service.create(dto);
      expect(result.downloadedPdf).toBe(false);

      // Track PDF download
      await service.markPdfDownloaded(result.id);
      const updated = await service.findById(result.id);
      expect(updated.downloadedPdf).toBe(true);
    });

    it('1.4. Campaña SAMTS Catalog registers interest with slot management', async () => {
      const dto: CreateLeadMagnetLeadDto = {
        name: 'Sofía Valderrama',
        email: 'sofia@boutiquechic.co',
        whatsapp: '+573123456789',
        businessType: 'Moda',
        businessName: 'Boutique Chic',
        solutionInterest: 'SAMTS Catalog',
        campaign: 'lanzamiento_20_dias',
        source: 'landing_campaign',
      };

      const result = await service.registerCampaign(dto);

      expect(result.campaign).toBe('lanzamiento_20_dias');
      expect(result.status).toBe(LeadStatus.SELECTED);
    });
  });

  describe('2. SAMTS Catalog: 5-Slot Capacity & Concurrency Protection', () => {
    it('2.1. Exactly 5 consecutive valid registrations are SELECTED', async () => {
      for (let i = 1; i <= 5; i++) {
        const lead = await service.registerCampaign({
          name: `Negocio ${i}`,
          email: `negocio${i}@test.com`,
          whatsapp: `+57310000000${i}`,
          campaign: 'lanzamiento_20_dias',
        });
        expect(lead.status).toBe(LeadStatus.SELECTED);
      }

      const stats = await service.getCampaignStats('lanzamiento_20_dias');
      expect(stats.total).toBe(5);
      expect(stats.selected).toBe(5);
      expect(stats.remaining).toBe(0);
      expect(stats.waitlist).toBe(0);
    });

    it('2.2. The 6th registration enters WAITLIST automatically', async () => {
      // Register 5 first
      for (let i = 1; i <= 5; i++) {
        await service.registerCampaign({
          name: `Seleccionado ${i}`,
          email: `sel${i}@test.com`,
          whatsapp: `+57310111000${i}`,
          campaign: 'lanzamiento_20_dias',
        });
      }

      // 6th candidate
      const sixth = await service.registerCampaign({
        name: 'Sexto Negocio',
        email: 'sexto@test.com',
        whatsapp: '+573109999999',
        campaign: 'lanzamiento_20_dias',
      });

      expect(sixth.status).toBe(LeadStatus.WAITLIST);

      const stats = await service.getCampaignStats('lanzamiento_20_dias');
      expect(stats.total).toBe(6);
      expect(stats.selected).toBe(5);
      expect(stats.waitlist).toBe(1);
      expect(stats.remaining).toBe(0);
    });

    it('2.3. Prevents duplicate registration by EMAIL', async () => {
      await service.registerCampaign({
        name: 'Usuario Uno',
        email: 'duplicado@test.com',
        whatsapp: '+573001112233',
        campaign: 'lanzamiento_20_dias',
      });

      await expect(
        service.registerCampaign({
          name: 'Usuario Uno Reintento',
          email: 'duplicado@test.com',
          whatsapp: '+573009998877',
          campaign: 'lanzamiento_20_dias',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('2.4. Prevents duplicate registration by WHATSAPP / PHONE', async () => {
      await service.registerCampaign({
        name: 'Usuario Teléfono 1',
        email: 'email1@test.com',
        whatsapp: '+573148180949',
        campaign: 'lanzamiento_20_dias',
      });

      await expect(
        service.registerCampaign({
          name: 'Usuario Teléfono 2 (Distinto Email, Mismo Tel)',
          email: 'email2_diferente@test.com',
          whatsapp: '+573148180949',
          campaign: 'lanzamiento_20_dias',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('2.5. Prevents frontend status manipulation', async () => {
      // Client tries to force 'SELECTED' status even when cupos are full
      for (let i = 1; i <= 5; i++) {
        await service.registerCampaign({
          name: `Cupo ${i}`,
          email: `cupo${i}@test.com`,
          whatsapp: `+57315000000${i}`,
          campaign: 'lanzamiento_20_dias',
        });
      }

      // Tampered payload
      const tamperedDto: any = {
        name: 'Hacker Intento',
        email: 'hacker@test.com',
        whatsapp: '+573159999999',
        campaign: 'lanzamiento_20_dias',
        status: LeadStatus.SELECTED, // Injected status
      };

      const result = await service.registerCampaign(tamperedDto);
      expect(result.status).toBe(LeadStatus.WAITLIST); // Backend overrides and enforces waitlist
    });

    it('2.6. CONCURRENCY: 2 simultaneous requests when 1 slot remains — exactly 1 SELECTED, 1 WAITLIST', async () => {
      // Pre-fill 4 slots
      for (let i = 1; i <= 4; i++) {
        await service.registerCampaign({
          name: `Previo ${i}`,
          email: `previo${i}@test.com`,
          whatsapp: `+57311000000${i}`,
          campaign: 'lanzamiento_20_dias',
        });
      }

      const statsBefore = await service.getCampaignStats('lanzamiento_20_dias');
      expect(statsBefore.selected).toBe(4);
      expect(statsBefore.remaining).toBe(1);

      // Launch 2 concurrent requests at the exact same tick
      const reqA = service.registerCampaign({
        name: 'Candidato Alpha',
        email: 'alpha@test.com',
        whatsapp: '+573121111111',
        campaign: 'lanzamiento_20_dias',
      });

      const reqB = service.registerCampaign({
        name: 'Candidato Beta',
        email: 'beta@test.com',
        whatsapp: '+573122222222',
        campaign: 'lanzamiento_20_dias',
      });

      const [resA, resB] = await Promise.all([reqA, reqB]);

      const statuses = [resA.status, resB.status];
      expect(statuses).toContain(LeadStatus.SELECTED);
      expect(statuses).toContain(LeadStatus.WAITLIST);

      const statsAfter = await service.getCampaignStats('lanzamiento_20_dias');
      expect(statsAfter.selected).toBe(5); // ZERO overselling
      expect(statsAfter.remaining).toBe(0);
      expect(statsAfter.waitlist).toBe(1);
    });
  });

  describe('3. CRM Management Operations', () => {
    it('3.1. Admin can list, filter by campaign and search leads', async () => {
      await service.create({
        name: 'Cliente Web',
        email: 'web@test.com',
        source: 'consultation_modal',
        campaign: 'general_contact',
      });

      await service.registerCampaign({
        name: 'Cliente Catalog',
        email: 'cat@test.com',
        campaign: 'lanzamiento_20_dias',
      });

      const all = await service.findAll();
      expect(all.length).toBe(2);

      const catalogLeads = all.filter((l) => l.campaign === 'lanzamiento_20_dias');
      expect(catalogLeads.length).toBe(1);
      expect(catalogLeads[0].name).toBe('Cliente Catalog');
    });

    it('3.2. Admin can update lead status, add notes and schedule follow-up', async () => {
      const created = await service.create({
        name: 'Mario Casas',
        email: 'mario@test.com',
        solutionInterest: 'Página Web',
      });

      const updated = await service.updateStatus(created.id, {
        status: LeadStatus.QUALIFIED,
        notes: 'Cliente muy interesado, reunión agendada para el lunes 10am',
        nextAction: 'Enviar demo en vivo de restaurante',
        followUpDate: '2026-11-10T15:00:00.000Z',
      });

      expect(updated.status).toBe(LeadStatus.QUALIFIED);
      expect(updated.notes).toBe('Cliente muy interesado, reunión agendada para el lunes 10am');
      expect(updated.nextAction).toBe('Enviar demo en vivo de restaurante');
      expect(updated.followUpDate).toBeDefined();
    });

    it('3.3. Admin can mark lead as converted (WON)', async () => {
      const created = await service.create({
        name: 'Diana Prince',
        email: 'diana@test.com',
      });

      await service.markConverted(created.id);

      const found = await service.findById(created.id);
      expect(found.convertedToClient).toBe(true);
      expect(found.status).toBe(LeadStatus.WON);
    });
  });
});
