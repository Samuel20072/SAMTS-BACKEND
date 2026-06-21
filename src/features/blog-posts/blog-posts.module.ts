import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './domain/entities/blog-post.entity';
import { IBlogPostRepository } from './domain/repositories/blog-post.repository.interface';
import { TypeOrmBlogPostRepository } from './infrastructure/persistence/typeorm-blog-post.repository';
import { BlogPostsService } from './application/blog-posts.service';
import { BlogPostsController } from './infrastructure/controllers/blog-posts.controller';
import { PublicBlogPostsController } from './infrastructure/controllers/public-blog-posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  controllers: [PublicBlogPostsController, BlogPostsController],
  providers: [
    BlogPostsService,
    {
      provide: IBlogPostRepository,
      useClass: TypeOrmBlogPostRepository,
    },
  ],
  exports: [BlogPostsService, IBlogPostRepository],
})
export class BlogPostsModule {}
