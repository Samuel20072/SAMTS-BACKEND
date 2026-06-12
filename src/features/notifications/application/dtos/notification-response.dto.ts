import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../../../shared/enums/notification-type.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.clientId = notification.clientId;
    dto.type = notification.type;
    dto.title = notification.title;
    dto.message = notification.message;
    dto.read = notification.read;
    dto.createdAt = notification.createdAt;
    return dto;
  }
}
