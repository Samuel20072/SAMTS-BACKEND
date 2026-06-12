import { ApiProperty } from '@nestjs/swagger';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleStatus } from '../../../../shared/enums/sale-status.enum';

export class SaleDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  subtotal: number;
}

export class SaleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty()
  customerPhone: string;

  @ApiProperty({ enum: SaleStatus })
  status: SaleStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [SaleDetailResponseDto] })
  details: SaleDetailResponseDto[];

  static fromEntity(sale: Sale): SaleResponseDto {
    const dto = new SaleResponseDto();
    dto.id = sale.id;
    dto.clientId = sale.clientId;
    dto.total = Number(sale.total);
    dto.customerName = sale.customerName;
    dto.customerEmail = sale.customerEmail;
    dto.customerPhone = sale.customerPhone;
    dto.status = sale.status;
    dto.createdAt = sale.createdAt;

    if (sale.details) {
      dto.details = sale.details.map((d) => {
        const detailDto = new SaleDetailResponseDto();
        detailDto.id = d.id;
        detailDto.productId = d.productId;
        detailDto.productName = d.product ? d.product.name : 'Unknown Product';
        detailDto.quantity = d.quantity;
        detailDto.unitPrice = Number(d.unitPrice);
        detailDto.subtotal = Number(d.subtotal);
        return detailDto;
      });
    } else {
      dto.details = [];
    }

    return dto;
  }
}
