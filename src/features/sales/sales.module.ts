import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './domain/entities/sale.entity';
import { SaleDetail } from './domain/entities/sale-detail.entity';
import { ISaleRepository } from './domain/repositories/sale.repository.interface';
import { TypeOrmSaleRepository } from './infrastructure/persistence/typeorm-sale.repository';
import { SalesService } from './application/sales.service';
import { SalesController } from './infrastructure/controllers/sales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleDetail])],
  controllers: [SalesController],
  providers: [
    SalesService,
    {
      provide: ISaleRepository,
      useClass: TypeOrmSaleRepository,
    },
  ],
  exports: [SalesService, ISaleRepository],
})
export class SalesModule {}
