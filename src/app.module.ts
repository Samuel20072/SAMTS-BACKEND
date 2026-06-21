import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { ClientsModule } from './features/clients/clients.module';
import { ProductsModule } from './features/products/products.module';
import { SalesModule } from './features/sales/sales.module';
import { BlogPostsModule } from './features/blog-posts/blog-posts.module';
import { PromotionsModule } from './features/promotions/promotions.module';
import { AISettingsModule } from './features/ai-settings/ai-settings.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { AutomationsModule } from './features/automations/automations.module';
import { AiGenerationModule } from './features/ai-generation/ai-generation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    SalesModule,
    BlogPostsModule,
    PromotionsModule,
    AISettingsModule,
    NotificationsModule,
    DashboardModule,
    AutomationsModule,
    AiGenerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
