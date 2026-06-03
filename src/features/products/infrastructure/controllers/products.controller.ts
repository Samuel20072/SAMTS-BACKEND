import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from '../../application/products.service';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { ProductResponseDto } from '../../application/dtos/product-response.dto';
import { ProductQueryDto } from '../../application/dtos/product-query.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new product for current tenant' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any): Promise<ProductResponseDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    // Super admins must specify a clientId in request body if not associated, but for simplicity let's assume they have a client context or we can accept clientId.
    const targetClientId = user.clientId || 'super-admin-global';
    return this.productsService.create(targetClientId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (filtered by tenant)' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can filter by client tenant ID' })
  async findAll(
    @Query() query: ProductQueryDto,
    @CurrentUser() user: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    let targetClientId: string | null = null;

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.clientId) {
        throw new ForbiddenException('User is not associated with any client');
      }
      targetClientId = user.clientId;
    } else if (tenantId) {
      targetClientId = tenantId;
    }

    return this.productsService.findAll(targetClientId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<ProductResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.productsService.findById(id, targetClientId);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Edit product details' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.productsService.update(id, targetClientId, updateProductDto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Manage stock of a product' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async updateStock(
    @Param('id') id: string,
    @Body('stock', ParseIntPipe) stock: number,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.productsService.updateStock(id, targetClientId, stock);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    await this.productsService.delete(id, targetClientId);
  }
}
