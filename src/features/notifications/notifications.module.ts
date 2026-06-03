import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity';
import { INotificationRepository } from './domain/repositories/notification.repository.interface';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { NotificationsService } from './application/notifications.service';
import { NotificationsController } from './infrastructure/controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: INotificationRepository,
      useClass: TypeOrmNotificationRepository,
    },
  ],
  exports: [NotificationsService, INotificationRepository],
})
export class NotificationsModule {}
