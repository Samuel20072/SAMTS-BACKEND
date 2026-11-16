import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadMagnetLead } from './domain/entities/lead-magnet-lead.entity';
import { ILeadMagnetRepository } from './domain/repositories/lead-magnet.repository.interface';
import { TypeOrmLeadMagnetRepository } from './infrastructure/persistence/typeorm-lead-magnet.repository';
import { LeadMagnetService } from './application/lead-magnet.service';
import { LeadInvitationsService } from './application/lead-invitations.service';
import { CatalogInvitationsClient } from './infrastructure/services/catalog-invitations.client';
import { ServiceKeyGuard } from './infrastructure/guards/service-key.guard';
import { LeadMagnetController } from './infrastructure/controllers/lead-magnet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeadMagnetLead])],
  controllers: [LeadMagnetController],
  providers: [
    LeadMagnetService,
    LeadInvitationsService,
    CatalogInvitationsClient,
    ServiceKeyGuard,
    {
      provide: ILeadMagnetRepository,
      useClass: TypeOrmLeadMagnetRepository,
    },
  ],
  exports: [LeadMagnetService, LeadInvitationsService],
})
export class LeadMagnetModule {}
