import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ISaleRepository } from '../domain/repositories/sale.repository.interface';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { SaleResponseDto } from './dtos/sale-response.dto';
import { Sale } from '../domain/entities/sale.entity';
import { SaleDetail } from '../domain/entities/sale-detail.entity';
import { Product } from '../../products/domain/entities/product.entity';
import { Notification } from '../../notifications/domain/entities/notification.entity';
import { NotificationType } from '../../../shared/enums/notification-type.enum';
import { SaleStatus } from '../../../shared/enums/sale-status.enum';

@Injectable()
export class SalesService {
  constructor(
    private readonly saleRepository: ISaleRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(clientId: string, createSaleDto: CreateSaleDto): Promise<SaleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepo = queryRunner.manager.getRepository(Product);
      const saleRepo = queryRunner.manager.getRepository(Sale);
      const saleDetailRepo = queryRunner.manager.getRepository(SaleDetail);
      const notificationRepo = queryRunner.manager.getRepository(Notification);

      let grandTotal = 0;
      const saleDetails: SaleDetail[] = [];

      // 1. Process details, validate stock, and calculate subtotal/total
      for (const item of createSaleDto.details) {
        const product = await productRepo.findOne({ where: { id: item.productId } });
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        if (product.clientId !== clientId) {
          throw new ForbiddenException(`Product ${product.name} does not belong to this client`);
        }
        if (!product.isActive) {
          throw new BadRequestException(`Product ${product.name} is not active`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        // Decrement stock
        product.stock -= item.quantity;
        await productRepo.save(product);

        const subtotal = Number(product.price) * item.quantity;
        grandTotal += subtotal;

        const detail = new SaleDetail();
        detail.productId = product.id;
        detail.product = product;
        detail.quantity = item.quantity;
        detail.unitPrice = Number(product.price);
        detail.subtotal = subtotal;

        saleDetails.push(detail);
      }

      // 2. Create the Sale
      const sale = new Sale();
      sale.clientId = clientId;
      sale.customerName = createSaleDto.customerName;
      sale.customerEmail = createSaleDto.customerEmail;
      sale.customerPhone = createSaleDto.customerPhone;
      sale.total = grandTotal;
      sale.status = SaleStatus.PENDING;
      sale.details = saleDetails;

      const savedSale = await saleRepo.save(sale);

      // 3. Create Notification for New Sale
      const notification = new Notification();
      notification.clientId = clientId;
      notification.type = NotificationType.SALE;
      notification.title = 'New Sale Received';
      notification.message = `A new sale of $${grandTotal.toFixed(2)} has been made by ${createSaleDto.customerName}.`;
      notification.read = false;

      await notificationRepo.save(notification);

      await queryRunner.commitTransaction();

      // Retrieve full sale with relations to return
      const fullSale = await this.saleRepository.findById(savedSale.id);
      return SaleResponseDto.fromEntity(fullSale!);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string, clientId: string | null): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    if (clientId && sale.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this sale');
    }
    return SaleResponseDto.fromEntity(sale);
  }

  async updateStatus(id: string, clientId: string | null, status: SaleStatus): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    if (clientId && sale.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to this sale');
    }

    sale.status = status;
    const saved = await this.saleRepository.save(sale);
    return SaleResponseDto.fromEntity(saved);
  }

  async findAll(
    clientId: string | null,
    options: { page?: number; limit?: number },
  ): Promise<{ data: SaleResponseDto[]; total: number }> {
    const skip = ((options.page || 0) * (options.limit || 10));
    const [sales, total] = await this.saleRepository.findAndCount(clientId, {
      skip,
      take: options.limit || 10,
    });

    return {
      data: sales.map((s) => SaleResponseDto.fromEntity(s)),
      total,
    };
  }
}
