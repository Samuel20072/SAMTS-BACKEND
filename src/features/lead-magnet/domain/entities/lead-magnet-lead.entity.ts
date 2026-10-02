import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';

@Entity('lead_magnet_leads')
export class LeadMagnetLead extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  whatsapp?: string;

  @Column()
  businessType: string;

  @Column({ nullable: true })
  hasWebsite?: string;

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

  @Column({ default: 'lead_magnet_pdf' })
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
