import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BlogStatus } from '../../../../shared/enums/blog-status.enum';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Modern Web Design Trends in 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'modern-web-design-trends-2026', required: false, description: 'Optional custom slug; auto-generated from the title when omitted.' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 'A short summary used for previews and SEO meta description.',
    required: false,
    description: 'Optional short excerpt/summary shown in listings and search results.',
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({ example: 'This is the post content...', description: 'Markdown or HTML text' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'https://images.url/post-image.png', required: false })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiProperty({ enum: BlogStatus, default: BlogStatus.DRAFT, required: false })
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;
}
