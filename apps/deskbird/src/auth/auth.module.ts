import { Module } from '@nestjs/common';
import { PASSWORD_SERVICE } from './application/services/password-service';
import { Argon2PasswordService } from './infrastructure/services/argon2.password-service';

@Module({
  providers: [
    {
      provide: PASSWORD_SERVICE,
      useClass: Argon2PasswordService,
    },
  ],
  exports: [PASSWORD_SERVICE],
})
export class AuthModule {}
