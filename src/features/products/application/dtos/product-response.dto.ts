import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../domain/entities/product.entity';

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  category: string;

  @ApiProperty()
  featured: boolean;

  @ApiProperty()
  priceType: string;

  @ApiProperty()
  features: string[];

  @ApiProperty()
  deliveryTime?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.clientId = product.clientId;
    dto.name = product.name;
    dto.description = product.description;
    dto.image = product.image;
    dto.price = Number(product.price);
    dto.stock = product.stock;
    dto.category = product.category;
    dto.featured = product.featured;
    dto.priceType = product.priceType || 'unique';
    dto.features = product.features || [];
    dto.deliveryTime = product.deliveryTime;
    dto.isActive = product.isActive;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    return dto;
  }
}
