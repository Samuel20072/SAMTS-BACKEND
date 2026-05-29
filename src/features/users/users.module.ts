import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { IUserRepository } from './domain/repositories/user.repository.interface';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users.use-case';
import { UsersController } from './infrastructure/controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindAllUsersUseCase,
    {
      provide: IUserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [IUserRepository],
})
export class UsersModule {}
