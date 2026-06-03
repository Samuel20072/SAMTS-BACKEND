import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';
import { SaleDetail } from './sale-detail.entity';
import { SaleStatus } from '../../../../shared/enums/sale-status.enum';

@Entity('sales')
export class Sale extends BaseEntity {
  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.sales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column({
    type: 'varchar',
    default: SaleStatus.PENDING,
  })
  status: SaleStatus;

  @OneToMany(() => SaleDetail, (detail) => detail.sale, { cascade: true })
  details: SaleDetail[];
}
