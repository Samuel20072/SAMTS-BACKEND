import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlogPostsService } from '../../application/blog-posts.service';
import { CreateBlogPostDto } from '../../application/dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from '../../application/dtos/update-blog-post.dto';
import { BlogPostResponseDto } from '../../application/dtos/blog-post-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { BlogStatus } from '../../../../shared/enums/blog-status.enum';

@ApiTags('blog-posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, type: BlogPostResponseDto })
  async create(@Body() createBlogPostDto: CreateBlogPostDto, @CurrentUser() user: any): Promise<BlogPostResponseDto> {
    if (!user.clientId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not associated with any client');
    }
    const targetClientId = user.clientId || 'super-admin-global';
    return this.blogPostsService.create(targetClientId, createBlogPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts (filtered by tenant)' })
  @ApiResponse({ status: 200, type: [BlogPostResponseDto] })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Super admins can filter by client tenant ID' })
  @ApiQuery({ name: 'status', required: false, enum: BlogStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BlogStatus,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ data: BlogPostResponseDto[]; total: number }> {
    let targetClientId: string | null = null;

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.clientId) {
        throw new ForbiddenException('User is not associated with any client');
      }
      targetClientId = user.clientId;
    } else if (tenantId) {
      targetClientId = tenantId;
    }

    return this.blogPostsService.findAll(targetClientId, {
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 10,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog post details by ID' })
  @ApiResponse({ status: 200, type: BlogPostResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<BlogPostResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.blogPostsService.findById(id, targetClientId);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Edit blog post details' })
  @ApiResponse({ status: 200, type: BlogPostResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
    @CurrentUser() user: any,
  ): Promise<BlogPostResponseDto> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    return this.blogPostsService.update(id, targetClientId, updateBlogPostDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Delete blog post' })
  @ApiResponse({ status: 200, description: 'Blog post successfully deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    const targetClientId = user.role === UserRole.SUPER_ADMIN ? null : user.clientId;
    await this.blogPostsService.delete(id, targetClientId);
  }
}
