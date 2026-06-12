import { Product } from '../entities/product.entity';

export abstract class IProductRepository {
  abstract save(product: Product): Promise<Product>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findAndCount(
    clientId: string | null,
    options: {
      search?: string;
      category?: string;
      featured?: boolean;
      activeOnly?: boolean;
      skip?: number;
      take?: number;
    },
  ): Promise<[Product[], number]>;
  abstract delete(id: string): Promise<void>;
}
