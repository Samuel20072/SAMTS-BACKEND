import { ApiProperty } from '@nestjs/swagger';

export class BlogResultDto {
  @ApiProperty() title: string;
  @ApiProperty() excerpt: string;
  @ApiProperty() content: string;
  @ApiProperty() metaDescription: string;
  @ApiProperty() slug: string;
}

export class PromotionResultDto {
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() discountPercent: number;
  @ApiProperty() cta: string;
}

export class WhatsappResultDto {
  @ApiProperty() promotionalMessage: string;
  @ApiProperty() informativeMessage: string;
  @ApiProperty() recoveryMessage: string;
}

export class BannerResultDto {
  @ApiProperty() title: string;
  @ApiProperty() subtitle: string;
  @ApiProperty() cta: string;
}

export class AiGenerationResponseDto<T = unknown> {
  @ApiProperty() id: string;
  @ApiProperty() contentType: string;
  @ApiProperty() generatedBy: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() result: T;
}
