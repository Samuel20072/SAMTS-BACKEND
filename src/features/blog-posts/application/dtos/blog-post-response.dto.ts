import { ApiProperty } from '@nestjs/swagger';
import { BlogPost } from '../../domain/entities/blog-post.entity';
import { BlogStatus } from '../../../../shared/enums/blog-status.enum';

export class BlogPostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  featuredImage?: string;

  @ApiProperty({ enum: BlogStatus })
  status: BlogStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(blog: BlogPost): BlogPostResponseDto {
    const dto = new BlogPostResponseDto();
    dto.id = blog.id;
    dto.clientId = blog.clientId;
    dto.title = blog.title;
    dto.slug = blog.slug;
    dto.content = blog.content;
    dto.featuredImage = blog.featuredImage;
    dto.status = blog.status;
    dto.createdAt = blog.createdAt;
    dto.updatedAt = blog.updatedAt;
    return dto;
  }
}
