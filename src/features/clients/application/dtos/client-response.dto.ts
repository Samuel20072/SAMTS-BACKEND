import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../../domain/entities/client.entity';

export class ClientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  businessType: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  logo?: string;

  @ApiProperty()
  websiteUrl?: string;

  @ApiProperty()
  primaryColor?: string;

  @ApiProperty()
  secondaryColor?: string;

  @ApiProperty()
  whatsappNumber?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  aiEnabled: boolean;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(client: Client): ClientResponseDto {
    const dto = new ClientResponseDto();
    dto.id = client.id;
    dto.businessName = client.businessName;
    dto.businessType = client.businessType;
    dto.description = client.description;
    dto.logo = client.logo;
    dto.websiteUrl = client.websiteUrl;
    dto.primaryColor = client.primaryColor;
    dto.secondaryColor = client.secondaryColor;
    dto.whatsappNumber = client.whatsappNumber;
    dto.email = client.email;
    dto.aiEnabled = client.aiEnabled;
    dto.plan = client.plan;
    dto.active = client.active;
    dto.createdAt = client.createdAt;
    dto.updatedAt = client.updatedAt;
    return dto;
  }
}
