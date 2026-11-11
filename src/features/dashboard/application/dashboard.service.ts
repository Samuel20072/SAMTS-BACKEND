import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import {
  DashboardResponseDto,
  MonthlyRevenueDto,
  RecentSaleDto,
  TopProductDto,
  RecentLeadActivityDto,
} from './dtos/dashboard-response.dto';
import { Sale } from '../../sales/domain/entities/sale.entity';
import { Product } from '../../products/domain/entities/product.entity';
import { BlogPost } from '../../blog-posts/domain/entities/blog-post.entity';
import { Promotion } from '../../promotions/domain/entities/promotion.entity';
import { SaleDetail } from '../../sales/domain/entities/sale-detail.entity';
import { LeadMagnetLead } from '../../lead-magnet/domain/entities/lead-magnet-lead.entity';
import { LeadStatus } from '../../../shared/enums/lead-status.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats(clientId: string | null): Promise<DashboardResponseDto> {
    const leadRepo = this.dataSource.getRepository(LeadMagnetLead);
    const saleRepo = this.dataSource.getRepository(Sale);
    const productRepo = this.dataSource.getRepository(Product);
    const blogRepo = this.dataSource.getRepository(BlogPost);
    const promoRepo = this.dataSource.getRepository(Promotion);

    // ─── 1. MÉTRICAS COMERCIALES Y CRM REALES DE SAMTS ──────────────────────
    const allLeads = await leadRepo.find({
      order: { createdAt: 'DESC' },
    });

    const totalLeads = allLeads.length;
    let newLeads = 0;
    let qualifiedLeads = 0;
    let proposalSentLeads = 0;
    let negotiationLeads = 0;
    let wonLeads = 0;
    let lostLeads = 0;
    let estimatedPipelineValue = 0;
    let wonRevenue = 0;
    let pendingFollowUps = 0;

    const leadsByStatus: Record<string, number> = {};
    const now = new Date();

    const openStatuses = new Set([
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL_SENT,
      LeadStatus.NEGOTIATION,
      LeadStatus.FOLLOW_UP,
      LeadStatus.SELECTED,
      LeadStatus.WAITLIST,
    ]);

    for (const lead of allLeads) {
      // Conteo por estado
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;

      switch (lead.status) {
        case LeadStatus.NEW:
          newLeads++;
          break;
        case LeadStatus.QUALIFIED:
          qualifiedLeads++;
          break;
        case LeadStatus.PROPOSAL_SENT:
          proposalSentLeads++;
          break;
        case LeadStatus.NEGOTIATION:
          negotiationLeads++;
          break;
        case LeadStatus.WON:
          wonLeads++;
          wonRevenue += Number(lead.estimatedValue || 0);
          break;
        case LeadStatus.LOST:
          lostLeads++;
          break;
      }

      if (openStatuses.has(lead.status)) {
        estimatedPipelineValue += Number(lead.estimatedValue || 0);
      }

      if (lead.followUpDate && new Date(lead.followUpDate) <= now && openStatuses.has(lead.status)) {
        pendingFollowUps++;
      }
    }

    const openOpportunities = totalLeads - wonLeads - lostLeads;
    const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;

    const recentLeads: RecentLeadActivityDto[] = allLeads.slice(0, 8).map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      businessName: l.businessName,
      solutionInterest: l.solutionInterest,
      status: l.status,
      estimatedValue: Number(l.estimatedValue || 0),
      createdAt: l.createdAt,
      followUpDate: l.followUpDate,
    }));

    // ─── 2. RECURSOS OPERATIVOS DE SAMTS / TENANT ───────────────────────────
    const whereScope: any = clientId === null ? { clientId: IsNull() } : { clientId };

    const totalProducts = await productRepo.count({ where: whereScope });
    const totalBlogPosts = await blogRepo.count({ where: whereScope });
    const totalPromotions = await promoRepo.count({ where: whereScope });
    const activePromotions = await promoRepo.count({ where: { ...whereScope, isActive: true } });

    // ─── 3. VENTAS (SI EXISTEN EN CLIENTE O VENTAS DIRECTAS) ────────────────
    const totalSales = await saleRepo.count({ where: whereScope });

    const revenueResult = await saleRepo
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'sum')
      .where(clientId === null ? 'sale.clientId IS NULL' : 'sale.clientId = :clientId', { clientId })
      .getRawOne();
    const totalRevenue = revenueResult && revenueResult.sum ? Number(revenueResult.sum) : 0;

    const monthlyData = await saleRepo
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(sale.total)', 'revenue')
      .where(clientId === null ? 'sale.clientId IS NULL' : 'sale.clientId = :clientId', { clientId })
      .groupBy("TO_CHAR(sale.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyRevenue: MonthlyRevenueDto[] = monthlyData.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue),
    }));

    const recentSalesEntities = await saleRepo.find({
      where: whereScope,
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentSales: RecentSaleDto[] = recentSalesEntities.map((s) => ({
      id: s.id,
      customerName: s.customerName,
      total: Number(s.total),
      status: s.status,
      createdAt: s.createdAt,
    }));

    const topSellingProducts: TopProductDto[] = [];
    if (clientId) {
      const topProductsRaw = await this.dataSource
        .getRepository(SaleDetail)
        .createQueryBuilder('detail')
        .innerJoin('detail.product', 'product')
        .select('detail.productId', 'productId')
        .addSelect('product.name', 'productName')
        .addSelect('SUM(detail.quantity)', 'quantitySold')
        .innerJoin('detail.sale', 'sale')
        .where('sale.clientId = :clientId', { clientId })
        .groupBy('detail.productId')
        .addGroupBy('product.name')
        .orderBy('SUM(detail.quantity)', 'DESC')
        .limit(5)
        .getRawMany();

      topSellingProducts.push(
        ...topProductsRaw.map((row) => ({
          productId: row.productId,
          productName: row.productName,
          quantitySold: Number(row.quantitySold),
        })),
      );
    }

    return {
      // Métricas CRM reales
      totalLeads,
      newLeads,
      qualifiedLeads,
      proposalSentLeads,
      negotiationLeads,
      wonLeads,
      lostLeads,
      openOpportunities,
      conversionRate,
      estimatedPipelineValue,
      wonRevenue,
      pendingFollowUps,
      leadsByStatus,
      recentLeads,
      // Recursos operativos
      totalProducts,
      totalBlogPosts,
      totalPromotions,
      activePromotions,
      // Compatibilidad ventas
      totalSales,
      totalRevenue,
      monthlyRevenue,
      recentSales,
      topSellingProducts,
    };
  }
}
