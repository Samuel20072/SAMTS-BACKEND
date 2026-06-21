import { Controller, Get, Post, Body, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AiGenerationService } from '../../application/ai-generation.service';
import { GenerateContentDto } from '../../application/dtos/generate-content.dto';
import {
  BlogResultDto,
  PromotionResultDto,
  WhatsappResultDto,
  BannerResultDto,
} from '../../application/dtos/generation-result.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiGenerationController {
  constructor(private readonly aiGenerationService: AiGenerationService) {}

  @Post('generate-blog')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Generate a blog post using AI templates' })
  @ApiResponse({ status: 201, type: BlogResultDto })
  async generateBlog(@Body() dto: GenerateContentDto, @CurrentUser() user: any): Promise<BlogResultDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || null;
    return this.aiGenerationService.generateBlog(targetClientId, dto);
  }

  @Post('generate-promotion')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Generate a promotion campaign using AI templates' })
  @ApiResponse({ status: 201, type: PromotionResultDto })
  async generatePromotion(@Body() dto: GenerateContentDto, @CurrentUser() user: any): Promise<PromotionResultDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || null;
    return this.aiGenerationService.generatePromotion(targetClientId, dto);
  }

  @Post('generate-whatsapp')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Generate WhatsApp message templates using AI templates' })
  @ApiResponse({ status: 201, type: WhatsappResultDto })
  async generateWhatsapp(@Body() dto: GenerateContentDto, @CurrentUser() user: any): Promise<WhatsappResultDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || null;
    return this.aiGenerationService.generateWhatsapp(targetClientId, dto);
  }

  @Post('generate-banner')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Generate banner content using AI templates' })
  @ApiResponse({ status: 201, type: BannerResultDto })
  async generateBanner(@Body() dto: GenerateContentDto, @CurrentUser() user: any): Promise<BannerResultDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || null;
    return this.aiGenerationService.generateBanner(targetClientId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI generation history for the client' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Super admins can filter or query history for a specific client' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clientId') queryClientId?: string,
  ) {
    let targetClientId: string | null;

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.clientId) {
        throw new ForbiddenException('User is not associated with any client');
      }
      targetClientId = user.clientId;
    } else {
      targetClientId = queryClientId || null;
    }

    return this.aiGenerationService.getHistory(targetClientId, {
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 10,
    });
  }
}
