import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from '../../application/promotions.service';
import { CreatePromotionDto } from '../../application/dtos/create-promotion.dto';
import { UpdatePromotionDto } from '../../application/dtos/update-promotion.dto';
import { PromotionResponseDto } from '../../application/dtos/promotion-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, type: PromotionResponseDto })
  async create(@Body() createPromotionDto: CreatePromotionDto, @CurrentUser() user: any): Promise<PromotionResponseDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || 'super-admin-global';
    return this.promotionsService.create(targetClientId, createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all promotions (filtered by tenant)' })
  @ApiResponse({ status: 200, type: [PromotionResponseDto] })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can filter by client tenant ID' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('activeOnly') activeOnly?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ data: PromotionResponseDto[]; total: number }> {
    let targetClientId: string | null = null;

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.clientId) {
        throw new ForbiddenException('User is not associated with any client');
      }
      targetClientId = user.clientId;
    } else if (tenantId) {
      targetClientId = tenantId;
    }

    const isActiveFilter = activeOnly !== undefined ? activeOnly === 'true' : undefined;

    return this.promotionsService.findAll(targetClientId, {
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 10,
      activeOnly: isActiveFilter,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion details by ID' })
  @ApiResponse({ status: 200, type: PromotionResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<PromotionResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.promotionsService.findById(id, targetClientId);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Edit promotion details' })
  @ApiResponse({ status: 200, type: PromotionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @CurrentUser() user: any,
  ): Promise<PromotionResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.promotionsService.update(id, targetClientId, updatePromotionDto);
  }

  @Patch(':id/active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Activate/deactivate promotion manually' })
  @ApiResponse({ status: 200, type: PromotionResponseDto })
  async toggleActive(
    @Param('id') id: string,
    @Body('active') active: boolean,
    @CurrentUser() user: any,
  ): Promise<PromotionResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.promotionsService.toggleActive(id, targetClientId, active);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiResponse({ status: 200, description: 'Promotion successfully deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    await this.promotionsService.delete(id, targetClientId);
  }
}
