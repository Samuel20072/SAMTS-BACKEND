import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';

@Entity('ai_settings')
export class AISettings extends BaseEntity {
  @Column()
  clientId: string;

  @OneToOne(() => Client, (client) => client.aiSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ default: 'Professional' })
  businessTone: string;

  @Column({ default: 'General Public' })
  targetAudience: string;

  @Column({ default: 'Brand Awareness' })
  businessObjective: string;

  @Column({ type: 'text', nullable: true })
  keywords: string; // Comma-separated list of keywords

  @Column({ default: 'WEEKLY' })
  postingFrequency: string; // DAILY, WEEKLY, MONTHLY

  @Column({ default: false })
  autoGenerateBlogs: boolean;

  @Column({ default: false })
  autoGeneratePromotions: boolean;

  @Column({ default: false })
  autoGenerateSeo: boolean;

  @Column({ default: false })
  autoGenerateWhatsappMessages: boolean;

  @Column({ default: true })
  isActive: boolean;
}
