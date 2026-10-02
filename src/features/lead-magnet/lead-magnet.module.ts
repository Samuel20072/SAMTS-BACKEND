import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadMagnetLead } from './domain/entities/lead-magnet-lead.entity';
import { ILeadMagnetRepository } from './domain/repositories/lead-magnet.repository.interface';
import { TypeOrmLeadMagnetRepository } from './infrastructure/persistence/typeorm-lead-magnet.repository';
import { LeadMagnetService } from './application/lead-magnet.service';
import { LeadMagnetController } from './infrastructure/controllers/lead-magnet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeadMagnetLead])],
  controllers: [LeadMagnetController],
  providers: [
    LeadMagnetService,
    {
      provide: ILeadMagnetRepository,
      useClass: TypeOrmLeadMagnetRepository,
    },
  ],
  exports: [LeadMagnetService],
})
export class LeadMagnetModule {}
