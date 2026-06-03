import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';
import { BlogStatus } from '../../../../shared/enums/blog-status.enum';

@Entity('blog_posts')
export class BlogPost extends BaseEntity {
  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.blogPosts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({
    type: 'varchar',
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;
}
