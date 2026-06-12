import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './domain/entities/client.entity';
import { IClientRepository } from './domain/repositories/client.repository.interface';
import { TypeOrmClientRepository } from './infrastructure/persistence/typeorm-client.repository';
import { ClientsService } from './application/clients.service';
import { ClientsController } from './infrastructure/controllers/clients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    {
      provide: IClientRepository,
      useClass: TypeOrmClientRepository,
    },
  ],
  exports: [ClientsService, IClientRepository],
})
export class ClientsModule {}
