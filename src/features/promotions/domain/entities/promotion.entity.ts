import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';

@Entity('promotions')
export class Promotion extends BaseEntity {
  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.promotions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;
}
