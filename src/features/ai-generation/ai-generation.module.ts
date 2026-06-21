import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiGeneration } from './domain/entities/ai-generation.entity';
import { IAiEngine } from './domain/interfaces/ai-engine.interface';
import { TemplateEngineService } from './infrastructure/engines/template-engine.service';
import { IAiGenerationRepository } from './domain/repositories/ai-generation.repository.interface';
import { TypeOrmAiGenerationRepository } from './infrastructure/persistence/typeorm-ai-generation.repository';
import { AiGenerationService } from './application/ai-generation.service';
import { AiGenerationController } from './infrastructure/controllers/ai-generation.controller';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { BlogPostsModule } from '../blog-posts/blog-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiGeneration]),
    ClientsModule,
    ProductsModule,
    PromotionsModule,
    BlogPostsModule,
  ],
  controllers: [AiGenerationController],
  providers: [
    AiGenerationService,
    {
      provide: IAiEngine,
      useClass: TemplateEngineService,
    },
    {
      provide: IAiGenerationRepository,
      useClass: TypeOrmAiGenerationRepository,
    },
  ],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
