import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BlogPostsService } from '../../application/blog-posts.service';
import { BlogPostResponseDto } from '../../application/dtos/blog-post-response.dto';
import { BlogStatus } from '../../../../shared/enums/blog-status.enum';

@ApiTags('public/blog-posts')
@Controller('blog-posts/public')
export class PublicBlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published blog posts (public)' })
  @ApiResponse({ status: 200, type: [BlogPostResponseDto] })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter by client ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllPublic(
    @Query('clientId') clientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: BlogPostResponseDto[]; total: number }> {
    return this.blogPostsService.findAll(clientId || null, {
      page: page ? Number(page) : 0,
      limit: limit ? Number(limit) : 100,
      status: BlogStatus.PUBLISHED,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get public blog post by slug' })
  @ApiResponse({ status: 200, type: BlogPostResponseDto })
  @ApiQuery({ name: 'clientId', required: false, description: 'Optional client ID' })
  async findOneBySlug(
    @Param('slug') slug: string,
    @Query('clientId') clientId?: string,
  ): Promise<BlogPostResponseDto> {
    return this.blogPostsService.findBySlug(slug, clientId || null);
  }
}
