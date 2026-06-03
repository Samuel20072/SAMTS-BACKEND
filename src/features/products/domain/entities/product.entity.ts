import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column()
  category: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: true })
  isActive: boolean;
}
