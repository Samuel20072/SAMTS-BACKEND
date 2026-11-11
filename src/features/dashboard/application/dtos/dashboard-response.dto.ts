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

export class RecentLeadActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  businessName?: string;

  @ApiProperty({ required: false })
  solutionInterest?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  estimatedValue: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  followUpDate?: Date;
}

export class DashboardResponseDto {
  // ─── Métricas Comerciales & CRM de SAMTS (100% Reales) ────────────────────
  @ApiProperty({ example: 45 })
  totalLeads: number;

  @ApiProperty({ example: 12 })
  newLeads: number;

  @ApiProperty({ example: 8 })
  qualifiedLeads: number;

  @ApiProperty({ example: 5 })
  proposalSentLeads: number;

  @ApiProperty({ example: 3 })
  negotiationLeads: number;

  @ApiProperty({ example: 6 })
  wonLeads: number;

  @ApiProperty({ example: 2 })
  lostLeads: number;

  @ApiProperty({ example: 28 })
  openOpportunities: number;

  @ApiProperty({ example: 13.3 })
  conversionRate: number;

  @ApiProperty({ example: 18500000 })
  estimatedPipelineValue: number;

  @ApiProperty({ example: 7500000 })
  wonRevenue: number;

  @ApiProperty({ example: 4 })
  pendingFollowUps: number;

  @ApiProperty({ example: { NEW: 12, QUALIFIED: 8, PROPOSAL_SENT: 5, WON: 6 } })
  leadsByStatus: Record<string, number>;

  @ApiProperty({ type: [RecentLeadActivityDto] })
  recentLeads: RecentLeadActivityDto[];

  // ─── Recursos Operativos Oficiales de SAMTS ───────────────────────────────
  @ApiProperty({ example: 6 })
  totalProducts: number;

  @ApiProperty({ example: 8 })
  totalBlogPosts: number;

  @ApiProperty({ example: 2 })
  totalPromotions: number;

  @ApiProperty({ example: 2 })
  activePromotions: number;

  // ─── E-commerce / Tenant Legacy Compatibility ─────────────────────────────
  @ApiProperty({ example: 0 })
  totalSales: number;

  @ApiProperty({ example: 0 })
  totalRevenue: number;

  @ApiProperty({ type: [MonthlyRevenueDto] })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({ type: [RecentSaleDto] })
  recentSales: RecentSaleDto[];

  @ApiProperty({ type: [TopProductDto] })
  topSellingProducts: TopProductDto[];
}
