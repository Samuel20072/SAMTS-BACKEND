import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { resolveSynchronize, validateTypeOrmConfig } from './shared/config/database.config';
import { HealthModule } from './features/health/health.module';
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
import { LeadMagnetModule } from './features/lead-magnet/lead-magnet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Valida la configuración antes de inicializar TypeORM (Fase 3.3).
        validateTypeOrmConfig(process.env);

        return {
          type: 'postgres' as const,
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          // Fail-safe: synchronize solo se activa en development/test.
          // En producción se exige el uso de migraciones versionadas.
          synchronize: resolveSynchronize(process.env),
          ssl:
            configService.get<string>('DB_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
    }),
    HealthModule,
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
    LeadMagnetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
