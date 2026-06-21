import { BlogPost } from '../entities/blog-post.entity';

export abstract class IBlogPostRepository {
  abstract save(blogPost: BlogPost): Promise<BlogPost>;
  abstract findById(id: string): Promise<BlogPost | null>;
  abstract findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number; status?: string },
  ): Promise<[BlogPost[], number]>;
  abstract findBySlug(slug: string, clientId: string | null): Promise<BlogPost | null>;
  abstract delete(id: string): Promise<void>;
}
