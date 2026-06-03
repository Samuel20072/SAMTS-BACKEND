import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPromotionRepository } from '../domain/repositories/promotion.repository.interface';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';
import { PromotionResponseDto } from './dtos/promotion-response.dto';
import { Promotion } from '../domain/entities/promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async create(clientId: string, createPromotionDto: CreatePromotionDto): Promise<PromotionResponseDto> {
    const promotion = new Promotion();
    Object.assign(promotion, createPromotionDto);
    promotion.clientId = clientId;
    promotion.startDate = new Date(createPromotionDto.startDate);
    promotion.endDate = new Date(createPromotionDto.endDate);
    promotion.isActive = true;

    const saved = await this.promotionRepository.save(promotion);
    return PromotionResponseDto.fromEntity(saved);
  }

  async update(id: string, clientId: string | null, updatePromotionDto: UpdatePromotionDto): Promise<PromotionResponseDto> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    if (clientId && promotion.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }

    Object.assign(promotion, updatePromotionDto);
    if (updatePromotionDto.startDate) {
      promotion.startDate = new Date(updatePromotionDto.startDate);
    }
    if (updatePromotionDto.endDate) {
      promotion.endDate = new Date(updatePromotionDto.endDate);
    }

    const saved = await this.promotionRepository.save(promotion);
    return PromotionResponseDto.fromEntity(saved);
  }

  async delete(id: string, clientId: string | null): Promise<void> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    if (clientId && promotion.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }
    await this.promotionRepository.delete(id);
  }

  async findById(id: string, clientId: string | null): Promise<PromotionResponseDto> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    if (clientId && promotion.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }
    return PromotionResponseDto.fromEntity(promotion);
  }

  async toggleActive(id: string, clientId: string | null, active: boolean): Promise<PromotionResponseDto> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    if (clientId && promotion.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }
    promotion.isActive = active;
    const saved = await this.promotionRepository.save(promotion);
    return PromotionResponseDto.fromEntity(saved);
  }

  async findAll(
    clientId: string | null,
    options: { page?: number; limit?: number; activeOnly?: boolean },
  ): Promise<{ data: PromotionResponseDto[]; total: number }> {
    const skip = (options.page || 0) * (options.limit || 10);
    const [promotions, total] = await this.promotionRepository.findAndCount(clientId, {
      skip,
      take: options.limit || 10,
      activeOnly: options.activeOnly,
    });

    return {
      data: promotions.map((p) => PromotionResponseDto.fromEntity(p)),
      total,
    };
  }
}
