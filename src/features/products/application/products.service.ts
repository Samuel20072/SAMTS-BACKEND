import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IProductRepository } from '../domain/repositories/product.repository.interface';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductResponseDto } from './dtos/product-response.dto';
import { ProductQueryDto } from './dtos/product-query.dto';
import { Product } from '../domain/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: IProductRepository) {}

  async create(clientId: string, createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = new Product();
    Object.assign(product, createProductDto);
    product.clientId = clientId;
    product.isActive = true;
    const saved = await this.productRepository.save(product);
    return ProductResponseDto.fromEntity(saved);
  }

  async update(id: string, clientId: string | null, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (clientId && product.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this product');
    }
    Object.assign(product, updateProductDto);
    const saved = await this.productRepository.save(product);
    return ProductResponseDto.fromEntity(saved);
  }

  async delete(id: string, clientId: string | null): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (clientId && product.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this product');
    }
    await this.productRepository.delete(id);
  }

  async findById(id: string, clientId: string | null): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (clientId && product.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this product');
    }
    return ProductResponseDto.fromEntity(product);
  }

  async findAll(
    clientId: string | null,
    query: ProductQueryDto,
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    const skip = (query.page || 0) * (query.limit || 10);
    const [products, total] = await this.productRepository.findAndCount(clientId, {
      search: query.search,
      category: query.category,
      featured: query.featured,
      activeOnly: query.activeOnly,
      skip,
      take: query.limit || 10,
    });

    return {
      data: products.map((p) => ProductResponseDto.fromEntity(p)),
      total,
    };
  }

  async updateStock(id: string, clientId: string | null, quantity: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (clientId && product.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this product');
    }
    product.stock = quantity;
    const saved = await this.productRepository.save(product);
    return ProductResponseDto.fromEntity(saved);
  }
}
