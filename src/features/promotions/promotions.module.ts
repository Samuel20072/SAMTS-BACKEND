import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './domain/entities/promotion.entity';
import { IPromotionRepository } from './domain/repositories/promotion.repository.interface';
import { TypeOrmPromotionRepository } from './infrastructure/persistence/typeorm-promotion.repository';
import { PromotionsService } from './application/promotions.service';
import { PromotionsController } from './infrastructure/controllers/promotions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    {
      provide: IPromotionRepository,
      useClass: TypeOrmPromotionRepository,
    },
  ],
  exports: [PromotionsService, IPromotionRepository],
})
export class PromotionsModule {}
