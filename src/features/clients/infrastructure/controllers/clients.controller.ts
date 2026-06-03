import { Controller, Get, Post, Put, Body, Param, UseGuards, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from '../../application/clients.service';
import { CreateClientDto } from '../../application/dtos/create-client.dto';
import { UpdateClientDto } from '../../application/dtos/update-client.dto';
import { ClientResponseDto } from '../../application/dtos/client-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create client business (Super Admin only)' })
  @ApiResponse({ status: 201, type: ClientResponseDto })
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all clients (Super Admin only)' })
  @ApiResponse({ status: 200, type: [ClientResponseDto] })
  async findAll(): Promise<ClientResponseDto[]> {
    return this.clientsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current client profile' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  async findMe(@CurrentUser() user: any): Promise<ClientResponseDto> {
    if (!user.clientId) {
      throw new ForbiddenException('User is not associated with any client');
    }
    return this.clientsService.findById(user.clientId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get client details by ID' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<ClientResponseDto> {
    if (user.role !== UserRole.SUPER_ADMIN && user.clientId !== id) {
      throw new ForbiddenException('You do not have access to this client');
    }
    return this.clientsService.findById(id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update current client business info' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  async updateMe(@Body() updateClientDto: UpdateClientDto, @CurrentUser() user: any): Promise<ClientResponseDto> {
    if (!user.clientId) {
      throw new ForbiddenException('User is not associated with any client');
    }
    return this.clientsService.update(user.clientId, updateClientDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Update client business info' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: any,
  ): Promise<ClientResponseDto> {
    if (user.role !== UserRole.SUPER_ADMIN && user.clientId !== id) {
      throw new ForbiddenException('You do not have access to update this client');
    }
    return this.clientsService.update(id, updateClientDto);
  }

  @Put(':id/ai')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate/deactivate AI capabilities' })
  async toggleAi(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
    @CurrentUser() user: any,
  ): Promise<ClientResponseDto> {
    if (user.role !== UserRole.SUPER_ADMIN && user.clientId !== id) {
      throw new ForbiddenException('You do not have access to toggle AI for this client');
    }
    return this.clientsService.toggleAi(id, enabled);
  }

  @Put(':id/plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Change subscription plan (Super Admin only)' })
  async changePlan(@Param('id') id: string, @Body('plan') plan: string): Promise<ClientResponseDto> {
    return this.clientsService.changePlan(id, plan);
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate/deactivate client status (Super Admin only)' })
  async toggleActive(@Param('id') id: string, @Body('active') active: boolean): Promise<ClientResponseDto> {
    return this.clientsService.toggleActive(id, active);
  }
}
