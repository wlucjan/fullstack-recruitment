import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/user.entity';
import { UsersController } from './api/users.controller';
import { USER_REPOSITORY } from './application/entities/user.repository';
import { UserSqlRepository } from './infrastructure/user.repository';
import { CreateUserCommandHandler } from './application/commands/create-user.command';
import { DeleteUserHandler } from './application/commands/delete-user.command';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { GetUserWithEmailQueryHandler } from './application/queries/get-user-with-email.query';
import { GetUserHandler } from './application/queries/get-user.query';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserOrmEntity]), AuthModule],
  controllers: [UsersController],
  providers: [
    CreateUserCommandHandler,
    DeleteUserHandler,
    GetUserWithEmailQueryHandler,
    GetUserHandler,
    {
      provide: USER_REPOSITORY,
      useClass: UserSqlRepository,
    },
  ],
})
export class UsersModule {}
