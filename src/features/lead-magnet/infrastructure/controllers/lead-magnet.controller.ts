import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadMagnetService } from '../../application/lead-magnet.service';
import { CreateLeadMagnetLeadDto } from '../../application/dtos/create-lead-magnet-lead.dto';
import { LeadMagnetLeadResponseDto } from '../../application/dtos/lead-magnet-lead-response.dto';
import { UpdateLeadStatusDto } from '../../application/dtos/update-lead-status.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';

@ApiTags('lead-magnet')
@Controller('lead-magnet')
export class LeadMagnetController {
  constructor(private readonly service: LeadMagnetService) {}

  /**
   * PUBLIC endpoint — no auth required.
   * Captures a new lead from landing page, consultation modal, or Samuel AI.
   */
  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register or enrich a commercial lead (public)' })
  @ApiResponse({ status: 201, type: LeadMagnetLeadResponseDto })
  async create(@Body() dto: CreateLeadMagnetLeadDto): Promise<LeadMagnetLeadResponseDto> {
    return this.service.create(dto);
  }

  /**
   * PUBLIC — Register for a launch campaign with slot control.
   */
  @Post('campaign/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register for a launch campaign (public)' })
  @ApiResponse({ status: 201, type: LeadMagnetLeadResponseDto })
  async registerCampaign(@Body() dto: CreateLeadMagnetLeadDto): Promise<LeadMagnetLeadResponseDto> {
    return this.service.registerCampaign(dto);
  }

  /**
   * PUBLIC — Get campaign stats (total registrations, slots remaining).
   */
  @Get('campaign/:campaign/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get campaign stats (public)' })
  async getCampaignStats(@Param('campaign') campaign: string) {
    return this.service.getCampaignStats(campaign);
  }

  /**
   * PUBLIC — Mark PDF as downloaded.
   */
  @Patch('leads/:id/pdf-downloaded')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark PDF as downloaded (public)' })
  async markPdfDownloaded(@Param('id') id: string): Promise<void> {
    return this.service.markPdfDownloaded(id);
  }

  /**
   * PUBLIC — Mark that the lead visited the diagnostic flow.
   */
  @Patch('leads/:id/diagnostic-visited')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark diagnostic flow visited (public)' })
  async markDiagnosticVisited(@Param('id') id: string): Promise<void> {
    return this.service.markDiagnosticVisited(id);
  }

  /**
   * PUBLIC — Mark that the lead clicked WhatsApp.
   */
  @Patch('leads/:id/whatsapp-clicked')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark WhatsApp click (public)' })
  async markWhatsappClicked(@Param('id') id: string): Promise<void> {
    return this.service.markWhatsappClicked(id);
  }

  /**
   * ADMIN ONLY — Get all leads for CRM/reporting.
   */
  @Get('leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all leads (Admin only)' })
  @ApiResponse({ status: 200, type: [LeadMagnetLeadResponseDto] })
  async findAll(): Promise<LeadMagnetLeadResponseDto[]> {
    return this.service.findAll();
  }

  /**
   * ADMIN ONLY — Get single lead.
   */
  @Get('leads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead by ID (Admin only)' })
  @ApiResponse({ status: 200, type: LeadMagnetLeadResponseDto })
  async findOne(@Param('id') id: string): Promise<LeadMagnetLeadResponseDto> {
    return this.service.findById(id);
  }

  /**
   * ADMIN ONLY — Update lead commercial status, notes, or next action.
   */
  @Patch('leads/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead status, notes and next action (Admin only)' })
  @ApiResponse({ status: 200, type: LeadMagnetLeadResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ): Promise<LeadMagnetLeadResponseDto> {
    return this.service.updateStatus(id, dto);
  }

  /**
   * ADMIN ONLY — Mark lead as converted to client.
   */
  @Patch('leads/:id/converted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lead as converted to client (Admin only)' })
  async markConverted(@Param('id') id: string): Promise<void> {
    return this.service.markConverted(id);
  }

  /**
   * ADMIN ONLY — Delete lead.
   */
  @Delete('leads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lead (Super Admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}
