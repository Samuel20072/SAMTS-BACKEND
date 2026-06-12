import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from '../../application/sales.service';
import { CreateSaleDto } from '../../application/dtos/create-sale.dto';
import { SaleResponseDto } from '../../application/dtos/sale-response.dto';
import { UpdateSaleStatusDto } from '../../application/dtos/update-sale-status.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, type: SaleResponseDto })
  async create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any): Promise<SaleResponseDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || 'super-admin-global';
    return this.salesService.create(targetClientId, createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get sales history (filtered by tenant)' })
  @ApiResponse({ status: 200, type: [SaleResponseDto] })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can filter by client tenant ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ data: SaleResponseDto[]; total: number }> {
    let targetClientId: string | null = null;

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.clientId) {
        throw new ForbiddenException('User is not associated with any client');
      }
      targetClientId = user.clientId;
    } else if (tenantId) {
      targetClientId = tenantId;
    }

    return this.salesService.findAll(targetClientId, {
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale details by ID' })
  @ApiResponse({ status: 200, type: SaleResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<SaleResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.salesService.findById(id, targetClientId);
  }

  @Put(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update sale status' })
  @ApiResponse({ status: 200, type: SaleResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateSaleStatusDto: UpdateSaleStatusDto,
    @CurrentUser() user: any,
  ): Promise<SaleResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.salesService.updateStatus(id, targetClientId, updateSaleStatusDto.status);
  }
}
