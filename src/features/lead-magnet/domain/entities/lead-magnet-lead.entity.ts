import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { LeadStatus } from '../../../../shared/enums/lead-status.enum';

@Entity('lead_magnet_leads')
export class LeadMagnetLead extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  whatsapp?: string;

  @Column({ default: 'General' })
  businessType: string;

  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  hasWebsite?: string;

  @Column({ nullable: true })
  mainProblem?: string;

  @Column({ nullable: true })
  solutionInterest?: string;

  @Column({ nullable: true })
  budget?: string;

  @Column({ nullable: true })
  urgency?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ nullable: true })
  diagnosticSessionId?: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  nextAction?: string;

  @Column({ type: 'timestamp', nullable: true })
  followUpDate?: Date;

  @Column({ nullable: true })
  utmSource?: string;

  @Column({ nullable: true })
  utmMedium?: string;

  @Column({ nullable: true })
  utmCampaign?: string;

  @Column({ nullable: true })
  utmContent?: string;

  @Column({ nullable: true })
  utmTerm?: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  landingPage?: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ default: 'general_contact' })
  campaign: string;

  @Column({ default: false })
  downloadedPdf: boolean;

  @Column({ default: false })
  visitedDiagnostic: boolean;

  @Column({ default: false })
  clickedWhatsapp: boolean;

  @Column({ default: false })
  convertedToClient: boolean;
}
