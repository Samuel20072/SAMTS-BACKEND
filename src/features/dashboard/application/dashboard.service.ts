import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DashboardResponseDto, MonthlyRevenueDto, RecentSaleDto, TopProductDto } from './dtos/dashboard-response.dto';
import { Sale } from '../../sales/domain/entities/sale.entity';
import { Product } from '../../products/domain/entities/product.entity';
import { BlogPost } from '../../blog-posts/domain/entities/blog-post.entity';
import { Promotion } from '../../promotions/domain/entities/promotion.entity';
import { SaleDetail } from '../../sales/domain/entities/sale-detail.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats(clientId: string): Promise<DashboardResponseDto> {
    const saleRepo = this.dataSource.getRepository(Sale);
    const productRepo = this.dataSource.getRepository(Product);
    const blogRepo = this.dataSource.getRepository(BlogPost);
    const promoRepo = this.dataSource.getRepository(Promotion);

    // 1. Total Sales Count
    const totalSales = await saleRepo.count({ where: { clientId } });

    // 2. Total Revenue Sum
    const revenueResult = await saleRepo
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'sum')
      .where('sale.clientId = :clientId', { clientId })
      .getRawOne();
    const totalRevenue = revenueResult && revenueResult.sum ? Number(revenueResult.sum) : 0;

    // 3. Total Products Count
    const totalProducts = await productRepo.count({ where: { clientId } });

    // 4. Total Blog Posts Count
    const totalBlogPosts = await blogRepo.count({ where: { clientId } });

    // 5. Total Promotions Count
    const totalPromotions = await promoRepo.count({ where: { clientId } });

    // 6. Active Promotions Count
    const activePromotions = await promoRepo.count({ where: { clientId, isActive: true } });

    // 7. Monthly Revenue grouping
    const monthlyData = await saleRepo
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(sale.total)', 'revenue')
      .where('sale.clientId = :clientId', { clientId })
      .groupBy("TO_CHAR(sale.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyRevenue: MonthlyRevenueDto[] = monthlyData.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue),
    }));

    // 8. Recent Sales (last 5)
    const recentSalesEntities = await saleRepo.find({
      where: { clientId },
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

    // 9. Top Selling Products (top 5)
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

    const topSellingProducts: TopProductDto[] = topProductsRaw.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      quantitySold: Number(row.quantitySold),
    }));

    // 10. AI Generated Content Count (simulated)
    // We can count blog posts and promotions and simulate that 60% of them are AI generated, or return a set count
    const aiGeneratedContentCount = Math.floor((totalBlogPosts + totalPromotions) * 0.7) + 3;

    return {
      totalSales,
      totalRevenue,
      totalProducts,
      totalBlogPosts,
      totalPromotions,
      activePromotions,
      monthlyRevenue,
      recentSales,
      topSellingProducts,
      aiGeneratedContentCount,
    };
  }
}
