import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SeederService } from './seeder.service';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [CqrsModule, UsersModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}