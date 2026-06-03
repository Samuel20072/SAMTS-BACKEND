import { Controller, Get, Put, Body, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AISettingsService } from '../../application/ai-settings.service';
import { UpdateAISettingsDto } from '../../application/dtos/update-ai-settings.dto';
import { AISettingsResponseDto } from '../../application/dtos/ai-settings-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('ai-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-settings')
export class AISettingsController {
  constructor(private readonly aiSettingsService: AISettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get AI configuration (filtered by tenant)' })
  @ApiResponse({ status: 200, type: AISettingsResponseDto })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can view any client settings' })
  async find(@CurrentUser() user: any, @Query('tenantId') tenantId?: string): Promise<AISettingsResponseDto> {
    let targetClientId = user.clientId;

    if (user.role === UserRole.SUPER_ADMIN && tenantId) {
      targetClientId = tenantId;
    }

    if (!targetClientId) {
      throw new ForbiddenException('User is not associated with any client');
    }

    return this.aiSettingsService.findByClientId(targetClientId);
  }

  @Put()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Configure AI behavior and tone' })
  @ApiResponse({ status: 200, type: AISettingsResponseDto })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can modify any client settings' })
  async update(
    @Body() updateDto: UpdateAISettingsDto,
    @CurrentUser() user: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<AISettingsResponseDto> {
    let targetClientId = user.clientId;

    if (user.role === UserRole.SUPER_ADMIN && tenantId) {
      targetClientId = tenantId;
    }

    if (!targetClientId) {
      throw new ForbiddenException('User is not associated with any client');
    }

    return this.aiSettingsService.update(targetClientId, updateDto);
  }
}
