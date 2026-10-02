import {
  Controller,
  Get,
  Post,
  Patch,
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
   * Captures a new lead from the landing page.
   */
  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new lead magnet lead (public)' })
  @ApiResponse({ status: 201, type: LeadMagnetLeadResponseDto })
  async create(@Body() dto: CreateLeadMagnetLeadDto): Promise<LeadMagnetLeadResponseDto> {
    return this.service.create(dto);
  }

  /**
   * PUBLIC — Mark PDF as downloaded (used after form submit + download click).
   * Uses PATCH to signal a partial update.
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
  @ApiOperation({ summary: 'Get all lead magnet leads (Super Admin only)' })
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
  @ApiOperation({ summary: 'Get lead by ID (Super Admin only)' })
  @ApiResponse({ status: 200, type: LeadMagnetLeadResponseDto })
  async findOne(@Param('id') id: string): Promise<LeadMagnetLeadResponseDto> {
    return this.service.findById(id);
  }

  /**
   * ADMIN ONLY — Mark lead as converted to client (exclude from future ad campaigns).
   */
  @Patch('leads/:id/converted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark lead as converted to client (Super Admin only)' })
  async markConverted(@Param('id') id: string): Promise<void> {
    return this.service.markConverted(id);
  }
}
