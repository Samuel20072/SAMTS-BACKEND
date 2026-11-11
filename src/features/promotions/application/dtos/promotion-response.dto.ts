import { ApiProperty } from '@nestjs/swagger';
import { Promotion } from '../../domain/entities/promotion.entity';

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  clientId?: string | null;

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

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  discountPercent?: number;

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
    dto.code = promo.code;
    dto.discountPercent = promo.discountPercent;
    dto.startDate = promo.startDate;
    dto.endDate = promo.endDate;
    dto.isActive = promo.isActive;
    dto.createdAt = promo.createdAt;
    return dto;
  }
}
