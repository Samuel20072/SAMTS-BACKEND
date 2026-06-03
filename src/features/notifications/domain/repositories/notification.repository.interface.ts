import { Notification } from '../entities/notification.entity';

export abstract class INotificationRepository {
  abstract save(notification: Notification): Promise<Notification>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number; unreadOnly?: boolean },
  ): Promise<[Notification[], number]>;
  abstract markAllAsRead(clientId: string): Promise<void>;
}
