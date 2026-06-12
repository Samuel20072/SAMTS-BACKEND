import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { INotificationRepository } from '../domain/repositories/notification.repository.interface';
import { NotificationResponseDto } from './dtos/notification-response.dto';
import { Notification } from '../domain/entities/notification.entity';
import { NotificationType } from '../../../shared/enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async create(
    clientId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<NotificationResponseDto> {
    const notification = new Notification();
    notification.clientId = clientId;
    notification.type = type;
    notification.title = title;
    notification.message = message;
    notification.read = false;

    const saved = await this.notificationRepository.save(notification);
    return NotificationResponseDto.fromEntity(saved);
  }

  async findAll(
    clientId: string | null,
    options: { page?: number; limit?: number; unreadOnly?: boolean },
  ): Promise<{ data: NotificationResponseDto[]; total: number }> {
    const skip = (options.page || 0) * (options.limit || 10);
    const [notifications, total] = await this.notificationRepository.findAndCount(clientId, {
      skip,
      take: options.limit || 10,
      unreadOnly: options.unreadOnly,
    });

    return {
      data: notifications.map((n) => NotificationResponseDto.fromEntity(n)),
      total,
    };
  }

  async markAsRead(id: string, clientId: string | null): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    if (clientId && notification.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this notification');
    }
    notification.read = true;
    const saved = await this.notificationRepository.save(notification);
    return NotificationResponseDto.fromEntity(saved);
  }

  async markAllAsRead(clientId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(clientId);
  }
}
