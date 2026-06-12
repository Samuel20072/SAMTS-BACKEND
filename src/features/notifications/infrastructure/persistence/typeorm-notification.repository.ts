import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly ormRepository: Repository<Notification>,
  ) {}

  async save(notification: Notification): Promise<Notification> {
    return this.ormRepository.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.ormRepository.findOne({
      where: { id },
    });
  }

  async findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number; unreadOnly?: boolean },
  ): Promise<[Notification[], number]> {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }
    if (options.unreadOnly !== undefined) {
      where.read = !options.unreadOnly; // wait, if unreadOnly is true, we want read = false.
      // So: where.read = false;
      if (options.unreadOnly) {
        where.read = false;
      }
    }

    return this.ormRepository.findAndCount({
      where,
      skip: options.skip || 0,
      take: options.take || 10,
      order: { createdAt: 'DESC' },
    });
  }

  async markAllAsRead(clientId: string): Promise<void> {
    await this.ormRepository.update({ clientId, read: false }, { read: true });
  }
}
