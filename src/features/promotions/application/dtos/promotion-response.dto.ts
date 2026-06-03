import { ApiProperty } from '@nestjs/swagger';
import { Promotion } from '../../domain/entities/promotion.entity';

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  bannerImage?: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(promo: Promotion): PromotionResponseDto {
    const dto = new PromotionResponseDto();
    dto.id = promo.id;
    dto.clientId = promo.clientId;
    dto.title = promo.title;
    dto.description = promo.description;
    dto.bannerImage = promo.bannerImage;
    dto.startDate = promo.startDate;
    dto.endDate = promo.endDate;
    dto.isActive = promo.isActive;
    dto.createdAt = promo.createdAt;
    return dto;
  }
}
