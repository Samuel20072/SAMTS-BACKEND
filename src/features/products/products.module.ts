import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './domain/entities/product.entity';
import { IProductRepository } from './domain/repositories/product.repository.interface';
import { TypeOrmProductRepository } from './infrastructure/persistence/typeorm-product.repository';
import { ProductsService } from './application/products.service';
import { ProductsController } from './infrastructure/controllers/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: IProductRepository,
      useClass: TypeOrmProductRepository,
    },
  ],
  exports: [ProductsService, IProductRepository],
})
export class ProductsModule {}
