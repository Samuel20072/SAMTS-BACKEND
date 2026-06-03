import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { User } from '../../../users/domain/entities/user.entity';
import { Product } from '../../../products/domain/entities/product.entity';
import { Sale } from '../../../sales/domain/entities/sale.entity';
import { BlogPost } from '../../../blog-posts/domain/entities/blog-post.entity';
import { Promotion } from '../../../promotions/domain/entities/promotion.entity';
import { AISettings } from '../../../ai-settings/domain/entities/ai-settings.entity';
import { Notification } from '../../../notifications/domain/entities/notification.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @Column()
  businessName: string;

  @Column()
  businessType: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ nullable: true })
  whatsappNumber?: string;

  @Column()
  email: string;

  @Column({ default: false })
  aiEnabled: boolean;

  @Column({ default: 'FREE' })
  plan: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => User, (user) => user.client)
  users: User[];

  @OneToMany(() => Product, (product) => product.client)
  products: Product[];

  @OneToMany(() => Sale, (sale) => sale.client)
  sales: Sale[];

  @OneToMany(() => BlogPost, (blogPost) => blogPost.client)
  blogPosts: BlogPost[];

  @OneToMany(() => Promotion, (promotion) => promotion.client)
  promotions: Promotion[];

  @OneToOne(() => AISettings, (aiSettings) => aiSettings.client)
  aiSettings: AISettings;

  @OneToMany(() => Notification, (notification) => notification.client)
  notifications: Notification[];
}
