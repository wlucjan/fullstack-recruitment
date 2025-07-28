import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/user.entity';
import { UsersController } from './api/users.controller';
import { USER_WRITE_REPOSITORY } from './application/entities/user.repository';
import { UserRepository } from './infrastructure/user.repository';
import { CreateUserCommandHandler } from './application/commands/create-user.command';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserOrmEntity]), AuthModule],
  controllers: [UsersController],
  providers: [
    CreateUserCommandHandler,
    {
      provide: USER_WRITE_REPOSITORY,
      useClass: UserRepository,
    },
  ],
})
export class UsersModule {}
