import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { LeadInvitationsService, SAMTS_CATALOG_CAMPAIGN } from './lead-invitations.service';
import { ILeadMagnetRepository } from '../domain/repositories/lead-magnet.repository.interface';
import { LeadMagnetLead } from '../domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../shared/enums/lead-status.enum';
import { CatalogInvitationsClient } from '../infrastructure/services/catalog-invitations.client';

/**
 * Pruebas de la lógica de invitaciones de lanzamiento hacia SAMTS Catalog.
 * El cliente S2S está totalmente mockeado (no se realizan peticiones reales).
 */
describe('LeadInvitationsService — invitaciones de lanzamiento SAMTS Catalog', () => {
  let service: LeadInvitationsService;
  let repository: { findById: jest.Mock; save: jest.Mock };
  let catalogClient: {
    issueInvitation: jest.Mock;
    resendInvitation: jest.Mock;
    getInvitationStatus: jest.Mock;
  };

  function makeLead(overrides: Partial<LeadMagnetLead> = {}): LeadMagnetLead {
    const lead = new LeadMagnetLead();
    lead.id = 'lead_1';
    lead.name = 'Negocio Uno';
    lead.email = 'negocio@test.com';
    lead.businessName = 'Negocio Uno SAS';
    lead.businessType = 'Retail';
    lead.campaign = SAMTS_CATALOG_CAMPAIGN;
    lead.status = LeadStatus.SELECTED;
    return Object.assign(lead, overrides);
  }

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
      findById: jest.fn(),
      save: jest.fn(async (lead: LeadMagnetLead) => lead),
    };
    catalogClient = {
      issueInvitation: jest.fn(),
      resendInvitation: jest.fn(),
      getInvitationStatus: jest.fn(),
    };

    service = new LeadInvitationsService(
      repository as unknown as ILeadMagnetRepository,
      catalogClient as unknown as CatalogInvitationsClient,
    );
  });

  describe('issueInvitationForLead', () => {
    it('rechaza un lead WAITLIST sin llamar al Catalog', async () => {
      repository.findById.mockResolvedValue(makeLead({ status: LeadStatus.WAITLIST }));

      await expect(service.issueInvitationForLead('lead_1')).rejects.toThrow(BadRequestException);
      expect(catalogClient.issueInvitation).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza cualquier estado distinto de SELECTED (p. ej. NEW)', async () => {
      repository.findById.mockResolvedValue(makeLead({ status: LeadStatus.NEW }));

      await expect(service.issueInvitationForLead('lead_1')).rejects.toThrow(BadRequestException);
      expect(catalogClient.issueInvitation).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el lead no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.issueInvitationForLead('missing')).rejects.toThrow(NotFoundException);
      expect(catalogClient.issueInvitation).not.toHaveBeenCalled();
    });

    it('rechaza un lead SELECTED con email inválido sin llamar al Catalog', async () => {
      repository.findById.mockResolvedValue(makeLead({ email: 'no-es-un-email' }));

      await expect(service.issueInvitationForLead('lead_1')).rejects.toThrow(BadRequestException);
      expect(catalogClient.issueInvitation).not.toHaveBeenCalled();
    });

    it('emite y persiste el estado de la invitación en el lead', async () => {
      const lead = makeLead();
      repository.findById.mockResolvedValue(lead);
      catalogClient.issueInvitation.mockResolvedValue({
        invitationId: 'inv_123',
        status: 'SENT',
        expiresAt: '2026-11-21T00:00:00.000Z',
        emailSent: true,
        reused: false,
      });

      const result = await service.issueInvitationForLead('lead_1');

      expect(catalogClient.issueInvitation).toHaveBeenCalledWith({
        email: 'negocio@test.com',
        externalLeadId: 'lead_1',
        campaign: SAMTS_CATALOG_CAMPAIGN,
        businessName: 'Negocio Uno SAS',
      });
      expect(result.invitationId).toBe('inv_123');
      expect(result.invitationStatus).toBe('SENT');
      expect(result.invitationIssuedAt).toBeInstanceOf(Date);
      expect(result.invitationSentAt).toBeInstanceOf(Date);
      expect(result.invitationExpiresAt).toEqual(new Date('2026-11-21T00:00:00.000Z'));
      expect(result.invitationLastError).toBeUndefined();

      // Persistencia real en el lead
      expect(lead.invitationId).toBe('inv_123');
      expect(lead.invitationStatus).toBe('SENT');
      expect(repository.save).toHaveBeenCalledWith(lead);
    });

    it('persiste invitationLastError y propaga el error si el Catalog falla', async () => {
      const lead = makeLead();
      repository.findById.mockResolvedValue(lead);
      catalogClient.issueInvitation.mockRejectedValue(
        new ServiceUnavailableException('SAMTS Catalog no disponible'),
      );

      await expect(service.issueInvitationForLead('lead_1')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(lead.invitationLastError).toBe('SAMTS Catalog no disponible');
      expect(repository.save).toHaveBeenCalledWith(lead);
    });
  });

  describe('resendInvitationForLead', () => {
    it('rechaza el reenvío si el lead no tiene invitación emitida', async () => {
      repository.findById.mockResolvedValue(makeLead());

      await expect(service.resendInvitationForLead('lead_1')).rejects.toThrow(BadRequestException);
      expect(catalogClient.resendInvitation).not.toHaveBeenCalled();
    });

    it('reenvía la misma invitación y actualiza el estado local', async () => {
      const lead = makeLead({
        invitationId: 'inv_123',
        invitationStatus: 'PENDING',
        invitationIssuedAt: new Date('2026-11-14T08:00:00.000Z'),
      });
      repository.findById.mockResolvedValue(lead);
      catalogClient.resendInvitation.mockResolvedValue({
        invitationId: 'inv_123',
        status: 'SENT',
        expiresAt: '2026-11-22T00:00:00.000Z',
        emailSent: true,
        reused: true,
      });

      const result = await service.resendInvitationForLead('lead_1');

      expect(catalogClient.resendInvitation).toHaveBeenCalledWith('inv_123');
      expect(result.invitationStatus).toBe('SENT');
      expect(result.invitationSentAt).toBeInstanceOf(Date);
      expect(result.invitationExpiresAt).toEqual(new Date('2026-11-22T00:00:00.000Z'));
      expect(lead.invitationLastError).toBeUndefined();
      expect(repository.save).toHaveBeenCalledWith(lead);
    });
  });

  describe('getLeadInvitation — sincronización perezosa', () => {
    it('sin invitación devuelve catalog.exists=false sin consultar al Catalog', async () => {
      repository.findById.mockResolvedValue(makeLead());

      const result = await service.getLeadInvitation('lead_1');

      expect(result.catalog).toEqual({ exists: false });
      expect(catalogClient.getInvitationStatus).not.toHaveBeenCalled();
    });

    it('sincroniza USED remoto → ACTIVATED local con la fecha de uso (idempotente)', async () => {
      const lead = makeLead({ invitationId: 'inv_123', invitationStatus: 'PENDING' });
      repository.findById.mockResolvedValue(lead);
      catalogClient.getInvitationStatus.mockResolvedValue({
        exists: true,
        campaign: SAMTS_CATALOG_CAMPAIGN,
        externalLeadId: 'lead_1',
        invitationId: 'inv_123',
        status: 'USED',
        usedAt: '2026-11-14T12:00:00.000Z',
      });

      const result = await service.getLeadInvitation('lead_1');

      expect(catalogClient.getInvitationStatus).toHaveBeenCalledWith(
        'lead_1',
        SAMTS_CATALOG_CAMPAIGN,
      );
      expect(result.status).toBe(LeadStatus.ACTIVATED);
      expect(result.invitationStatus).toBe('USED');
      expect(result.invitationActivatedAt).toEqual(new Date('2026-11-14T12:00:00.000Z'));
      expect(lead.status).toBe(LeadStatus.ACTIVATED);
      expect(repository.save).toHaveBeenCalledWith(lead);
    });

    it('tolera fallos del Catalog y devuelve los datos locales con flag de error', async () => {
      const lead = makeLead({ invitationId: 'inv_123', invitationStatus: 'SENT' });
      repository.findById.mockResolvedValue(lead);
      catalogClient.getInvitationStatus.mockRejectedValue(
        new ServiceUnavailableException('timeout'),
      );

      const result = await service.getLeadInvitation('lead_1');

      expect(result.syncError).toBe(true);
      expect(result.status).toBe(LeadStatus.SELECTED);
      expect(result.invitationId).toBe('inv_123');
      expect(result.invitationStatus).toBe('SENT');
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('handleActivationCallback — idempotente', () => {
    it('marca el lead ACTIVATED y sella la fecha de activación', async () => {
      const lead = makeLead({ invitationId: 'inv_123', invitationStatus: 'SENT' });
      repository.findById.mockResolvedValue(lead);

      const result = await service.handleActivationCallback({
        externalLeadId: 'lead_1',
        activatedAt: '2026-11-14T10:00:00.000Z',
        campaign: SAMTS_CATALOG_CAMPAIGN,
      });

      expect(result.status).toBe(LeadStatus.ACTIVATED);
      expect(result.invitationStatus).toBe('USED');
      expect(result.invitationActivatedAt).toEqual(new Date('2026-11-14T10:00:00.000Z'));
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('un segundo callback no altera la activación ya registrada', async () => {
      const lead = makeLead({ invitationId: 'inv_123', invitationStatus: 'SENT' });
      repository.findById.mockResolvedValue(lead);

      await service.handleActivationCallback({
        externalLeadId: 'lead_1',
        activatedAt: '2026-11-14T10:00:00.000Z',
      });
      const second = await service.handleActivationCallback({
        externalLeadId: 'lead_1',
        activatedAt: '2026-11-15T09:00:00.000Z',
      });

      expect(second.invitationActivatedAt).toEqual(new Date('2026-11-14T10:00:00.000Z'));
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('lanza NotFoundException si el externalLeadId no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.handleActivationCallback({
          externalLeadId: 'missing',
          activatedAt: '2026-11-14T10:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
