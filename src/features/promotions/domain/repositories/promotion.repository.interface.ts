import { Promotion } from '../entities/promotion.entity';

export abstract class IPromotionRepository {
  abstract save(promotion: Promotion): Promise<Promotion>;
  abstract findById(id: string): Promise<Promotion | null>;
  abstract findAndCount(
    clientId: string | null,
    options: { skip?: number; take?: number; activeOnly?: boolean },
  ): Promise<[Promotion[], number]>;
  abstract delete(id: string): Promise<void>;
}
