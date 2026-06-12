import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../../application/dashboard.service';
import { DashboardResponseDto } from '../../application/dtos/dashboard-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard analytics stats (filtered by tenant)' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can filter by client tenant ID' })
  async getStats(@CurrentUser() user: any, @Query('tenantId') tenantId?: string): Promise<DashboardResponseDto> {
    let targetClientId = user.clientId;

    if (user.role === UserRole.SUPER_ADMIN && tenantId) {
      targetClientId = tenantId;
    }

    if (!targetClientId) {
      throw new ForbiddenException('User is not associated with any client');
    }

    return this.dashboardService.getStats(targetClientId);
  }
}
