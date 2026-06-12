import { Sale } from '../entities/sale.entity';

export abstract class ISaleRepository {
  abstract save(sale: Sale): Promise<Sale>;
  abstract findById(id: string): Promise<Sale | null>;
  abstract findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number },
  ): Promise<[Sale[], number]>;
}
