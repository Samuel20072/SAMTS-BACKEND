import { Controller, Get, Patch, Post, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from '../../application/notifications.service';
import { NotificationResponseDto } from '../../application/dtos/notification-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications (filtered by tenant)' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can filter by client tenant ID' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ data: NotificationResponseDto[]; total: number }> {
    let targetClientId: string | null = null;

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.clientId) {
        throw new ForbiddenException('User is not associated with any client');
      }
      targetClientId = user.clientId;
    } else if (tenantId) {
      targetClientId = tenantId;
    }

    const unreadOnlyFilter = unreadOnly !== undefined ? unreadOnly === 'true' : undefined;

    return this.notificationsService.findAll(targetClientId, {
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 10,
      unreadOnly: unreadOnlyFilter,
    });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any): Promise<NotificationResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.notificationsService.markAsRead(id, targetClientId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current tenant' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: any): Promise<void> {
    if (!user.clientId) {
      throw new ForbiddenException('User is not associated with any client');
    }
    await this.notificationsService.markAllAsRead(user.clientId);
  }
}
