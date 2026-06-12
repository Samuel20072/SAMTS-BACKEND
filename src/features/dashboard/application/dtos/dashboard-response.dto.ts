import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueDto {
  @ApiProperty({ example: '2026-05' })
  month: string;

  @ApiProperty({ example: 1250.5 })
  revenue: number;
}

export class RecentSaleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class TopProductDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantitySold: number;
}

export class DashboardResponseDto {
  @ApiProperty({ example: 45 })
  totalSales: number;

  @ApiProperty({ example: 5400.75 })
  totalRevenue: number;

  @ApiProperty({ example: 12 })
  totalProducts: number;

  @ApiProperty({ example: 8 })
  totalBlogPosts: number;

  @ApiProperty({ example: 4 })
  totalPromotions: number;

  @ApiProperty({ example: 2 })
  activePromotions: number;

  @ApiProperty({ type: [MonthlyRevenueDto] })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({ type: [RecentSaleDto] })
  recentSales: RecentSaleDto[];

  @ApiProperty({ type: [TopProductDto] })
  topSellingProducts: TopProductDto[];

  @ApiProperty({ example: 15 })
  aiGeneratedContentCount: number;
}
