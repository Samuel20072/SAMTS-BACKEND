import { ApiProperty } from '@nestjs/swagger';
import { LeadMagnetLead } from '../../domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../../shared/enums/lead-status.enum';

/** Instantánea del estado remoto de la invitación en SAMTS Catalog. */
export class CatalogInvitationSnapshotDto {
  @ApiProperty() exists: boolean;
  @ApiProperty({ required: false }) status?: string;
  @ApiProperty({ required: false }) emailMasked?: string;
  @ApiProperty({ required: false }) issuedAt?: string;
  @ApiProperty({ required: false }) sentAt?: string;
  @ApiProperty({ required: false }) usedAt?: string;
  @ApiProperty({ required: false }) expiresAt?: string;
  @ApiProperty({ required: false }) revokedAt?: string;
  @ApiProperty({ required: false, nullable: true }) lastError?: string | null;
  @ApiProperty({ required: false }) trialDays?: number;
}

/**
 * Resultado de emisión/reenvío/estado de la invitación de un lead.
 * Combina el estado local persistido en SAMTS con (opcionalmente) la
 * instantánea remota del Catalog en la consulta de estado.
 */
export class LeadInvitationResponseDto {
  @ApiProperty() leadId: string;
  @ApiProperty() email: string;
  @ApiProperty() campaign: string;
  @ApiProperty({ enum: LeadStatus }) status: LeadStatus;

  @ApiProperty({ required: false }) invitationId?: string;
  @ApiProperty({ required: false }) invitationStatus?: string;
  @ApiProperty({ required: false }) invitationIssuedAt?: Date;
  @ApiProperty({ required: false }) invitationSentAt?: Date;
  @ApiProperty({ required: false }) invitationActivatedAt?: Date;
  @ApiProperty({ required: false }) invitationExpiresAt?: Date;
  @ApiProperty({ required: false }) invitationLastError?: string;

  @ApiProperty({ required: false, type: CatalogInvitationSnapshotDto })
  catalog?: CatalogInvitationSnapshotDto;

  @ApiProperty({ required: false, description: 'true si la consulta al Catalog falló' })
  syncError?: boolean;

  static fromEntity(
    entity: LeadMagnetLead,
    catalog?: CatalogInvitationSnapshotDto,
  ): LeadInvitationResponseDto {
    const dto = new LeadInvitationResponseDto();
    dto.leadId = entity.id;
    dto.email = entity.email;
    dto.campaign = entity.campaign;
    dto.status = entity.status || LeadStatus.NEW;
    dto.invitationId = entity.invitationId;
    dto.invitationStatus = entity.invitationStatus;
    dto.invitationIssuedAt = entity.invitationIssuedAt;
    dto.invitationSentAt = entity.invitationSentAt;
    dto.invitationActivatedAt = entity.invitationActivatedAt;
    dto.invitationExpiresAt = entity.invitationExpiresAt;
    dto.invitationLastError = entity.invitationLastError;
    if (catalog) dto.catalog = catalog;
    return dto;
  }
}
