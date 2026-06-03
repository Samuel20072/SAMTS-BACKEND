import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SaleStatus } from '../../../../shared/enums/sale-status.enum';

export class UpdateSaleStatusDto {
  @ApiProperty({ enum: SaleStatus })
  @IsEnum(SaleStatus)
  status: SaleStatus;
}
