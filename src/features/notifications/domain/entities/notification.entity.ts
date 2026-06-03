import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';
import { NotificationType } from '../../../../shared/enums/notification-type.enum';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({
    type: 'varchar',
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  read: boolean;
}
