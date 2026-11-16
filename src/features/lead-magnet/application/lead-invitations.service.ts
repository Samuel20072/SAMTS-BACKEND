import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ILeadMagnetRepository } from '../domain/repositories/lead-magnet.repository.interface';
import { LeadMagnetLead } from '../domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../shared/enums/lead-status.enum';
import { CatalogInvitationsClient } from '../infrastructure/services/catalog-invitations.client';
import {
  CatalogInvitationSnapshotDto,
  LeadInvitationResponseDto,
} from './dtos/lead-invitation-response.dto';
import { ActivationCallbackDto } from './dtos/activation-callback.dto';

/** Campaña por defecto del flujo de invitaciones de lanzamiento. */
export const SAMTS_CATALOG_CAMPAIGN = 'lanzamiento_20_dias';

/** Estados remotos de invitación devueltos por el Catalog. */
const REMOTE_STATUS_USED = 'USED';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Lógica de negocio del flujo de invitaciones de lanzamiento hacia SAMTS Catalog.
 *
 * SAMTS solicita la emisión/reenvío y guarda el estado localmente; el Catalog es
 * el propietario de la invitación y del token. La activación se sincroniza de
 * forma segura por pull (S2S) y, opcionalmente, por el callback idempotente.
 */
@Injectable()
export class LeadInvitationsService {
  private readonly logger = new Logger(LeadInvitationsService.name);

  constructor(
    private readonly repository: ILeadMagnetRepository,
    private readonly catalogClient: CatalogInvitationsClient,
  ) {}

  /**
   * Emite (o reutiliza) una invitación para un lead SELECTED.
   * Rechaza WAITLIST y cualquier otro estado.
   */
  async issueInvitationForLead(leadId: string): Promise<LeadInvitationResponseDto> {
    const lead = await this.loadLeadOrFail(leadId);

    if (lead.status !== LeadStatus.SELECTED) {
      throw new BadRequestException(
        `Solo los leads con estado SELECTED pueden recibir una invitación (estado actual: ${lead.status}).`,
      );
    }

    const email = (lead.email || '').toLowerCase().trim();
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new BadRequestException('El lead no tiene un correo electrónico válido.');
    }

    const campaign = lead.campaign || SAMTS_CATALOG_CAMPAIGN;

    try {
      const result = await this.catalogClient.issueInvitation({
        email,
        externalLeadId: lead.id,
        campaign,
        businessName: lead.businessName,
      });

      const now = new Date();
      lead.invitationId = result.invitationId;
      lead.invitationStatus = result.status;
      lead.invitationIssuedAt = lead.invitationIssuedAt ?? now;
      if (result.emailSent) lead.invitationSentAt = now;
      if (result.expiresAt) lead.invitationExpiresAt = new Date(result.expiresAt);
      lead.invitationLastError = undefined;

      await this.repository.save(lead);

      this.logger.log(
        `[INVITACIÓN] Emitida para lead ${lead.id} | invitationId: ${result.invitationId} | Estado: ${result.status} | Reutilizada: ${Boolean(result.reused)}`,
      );

      return LeadInvitationResponseDto.fromEntity(lead);
    } catch (error) {
      lead.invitationLastError = this.toErrorMessage(error);
      await this.repository.save(lead);
      throw error;
    }
  }

  /** Reenvía la invitación existente de un lead. Exige que exista `invitationId`. */
  async resendInvitationForLead(leadId: string): Promise<LeadInvitationResponseDto> {
    const lead = await this.loadLeadOrFail(leadId);

    if (!lead.invitationId) {
      throw new BadRequestException('El lead no tiene una invitación emitida para reenviar.');
    }

    try {
      const result = await this.catalogClient.resendInvitation(lead.invitationId);

      const now = new Date();
      lead.invitationStatus = result.status;
      if (result.emailSent) lead.invitationSentAt = now;
      if (result.expiresAt) lead.invitationExpiresAt = new Date(result.expiresAt);
      lead.invitationLastError = undefined;

      await this.repository.save(lead);

      this.logger.log(
        `[INVITACIÓN] Reenviada para lead ${lead.id} | invitationId: ${lead.invitationId} | Estado: ${result.status}`,
      );

      return LeadInvitationResponseDto.fromEntity(lead);
    } catch (error) {
      lead.invitationLastError = this.toErrorMessage(error);
      await this.repository.save(lead);
      throw error;
    }
  }

  /**
   * Devuelve el estado local de la invitación y, si existe `invitationId`,
   * sincroniza perezosamente contra el Catalog: si el estado remoto es USED y el
   * lead local aún no está ACTIVATED, lo marca ACTIVATED de forma idempotente.
   * Tolera fallos del Catalog devolviendo los datos locales con `syncError`.
   */
  async getLeadInvitation(leadId: string): Promise<LeadInvitationResponseDto> {
    const lead = await this.loadLeadOrFail(leadId);
    const dto = LeadInvitationResponseDto.fromEntity(lead);

    if (!lead.invitationId) {
      dto.catalog = { exists: false };
      return dto;
    }

    const campaign = lead.campaign || SAMTS_CATALOG_CAMPAIGN;

    try {
      const remote = await this.catalogClient.getInvitationStatus(lead.id, campaign);

      const snapshot: CatalogInvitationSnapshotDto = {
        exists: remote.exists,
        status: remote.status,
        emailMasked: remote.emailMasked,
        issuedAt: remote.issuedAt,
        sentAt: remote.sentAt,
        usedAt: remote.usedAt,
        expiresAt: remote.expiresAt,
        revokedAt: remote.revokedAt,
        lastError: remote.lastError ?? null,
        trialDays: remote.trialDays,
      };
      dto.catalog = snapshot;

      let changed = false;

      if (remote.status && remote.status !== lead.invitationStatus) {
        lead.invitationStatus = remote.status;
        changed = true;
      }

      if (remote.status === REMOTE_STATUS_USED && lead.status !== LeadStatus.ACTIVATED) {
        lead.status = LeadStatus.ACTIVATED;
        lead.invitationStatus = REMOTE_STATUS_USED;
        lead.invitationActivatedAt = remote.usedAt ? new Date(remote.usedAt) : new Date();
        changed = true;
      }

      if (changed) {
        await this.repository.save(lead);
        const refreshed = LeadInvitationResponseDto.fromEntity(lead);
        refreshed.catalog = snapshot;
        return refreshed;
      }

      return dto;
    } catch (error) {
      this.logger.warn(
        `[INVITACIÓN] No se pudo consultar el estado remoto para el lead ${lead.id}: ${this.toErrorMessage(error)}`,
      );
      dto.syncError = true;
      return dto;
    }
  }

  /**
   * Callback S2S idempotente: marca el lead ACTIVATED y sella la fecha de activación.
   * Un segundo callback con los mismos datos no altera el estado ya activado.
   */
  async handleActivationCallback(dto: ActivationCallbackDto): Promise<LeadInvitationResponseDto> {
    const lead = await this.loadLeadOrFail(dto.externalLeadId);

    if (lead.status === LeadStatus.ACTIVATED && lead.invitationActivatedAt) {
      return LeadInvitationResponseDto.fromEntity(lead);
    }

    lead.status = LeadStatus.ACTIVATED;
    lead.invitationStatus = REMOTE_STATUS_USED;
    lead.invitationActivatedAt = dto.activatedAt
      ? new Date(dto.activatedAt)
      : lead.invitationActivatedAt ?? new Date();

    await this.repository.save(lead);

    this.logger.log(
      `[INVITACIÓN] Activación registrada para lead ${lead.id} | Fecha: ${lead.invitationActivatedAt.toISOString()}`,
    );

    return LeadInvitationResponseDto.fromEntity(lead);
  }

  private async loadLeadOrFail(leadId: string): Promise<LeadMagnetLead> {
    const lead = await this.repository.findById(leadId);
    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);
    return lead;
  }

  private toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
