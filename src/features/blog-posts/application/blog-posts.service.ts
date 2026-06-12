import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IBlogPostRepository } from '../domain/repositories/blog-post.repository.interface';
import { CreateBlogPostDto } from './dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from './dtos/update-blog-post.dto';
import { BlogPostResponseDto } from './dtos/blog-post-response.dto';
import { BlogPost } from '../domain/entities/blog-post.entity';
import { BlogStatus } from '../../../shared/enums/blog-status.enum';

@Injectable()
export class BlogPostsService {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  async create(clientId: string, createBlogPostDto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    const blogPost = new BlogPost();
    Object.assign(blogPost, createBlogPostDto);
    blogPost.clientId = clientId;
    blogPost.slug = this.slugify(createBlogPostDto.title);
    blogPost.status = createBlogPostDto.status || BlogStatus.DRAFT;

    const saved = await this.blogPostRepository.save(blogPost);
    return BlogPostResponseDto.fromEntity(saved);
  }

  async update(id: string, clientId: string | null, updateBlogPostDto: UpdateBlogPostDto): Promise<BlogPostResponseDto> {
    const blogPost = await this.blogPostRepository.findById(id);
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    if (clientId && blogPost.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this blog post');
    }

    Object.assign(blogPost, updateBlogPostDto);
    if (updateBlogPostDto.title) {
      blogPost.slug = this.slugify(updateBlogPostDto.title);
    }

    const saved = await this.blogPostRepository.save(blogPost);
    return BlogPostResponseDto.fromEntity(saved);
  }

  async delete(id: string, clientId: string | null): Promise<void> {
    const blogPost = await this.blogPostRepository.findById(id);
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    if (clientId && blogPost.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this blog post');
    }
    await this.blogPostRepository.delete(id);
  }

  async findById(id: string, clientId: string | null): Promise<BlogPostResponseDto> {
    const blogPost = await this.blogPostRepository.findById(id);
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    if (clientId && blogPost.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this blog post');
    }
    return BlogPostResponseDto.fromEntity(blogPost);
  }

  async findAll(
    clientId: string | null,
    options: { page?: number; limit?: number; status?: BlogStatus },
  ): Promise<{ data: BlogPostResponseDto[]; total: number }> {
    const skip = (options.page || 0) * (options.limit || 10);
    const [blogs, total] = await this.blogPostRepository.findAndCount(clientId, {
      skip,
      take: options.limit || 10,
      status: options.status,
    });

    return {
      data: blogs.map((b) => BlogPostResponseDto.fromEntity(b)),
      total,
    };
  }
}
