import { Module } from '@nestjs/common';
import { PASSWORD_SERVICE } from './application/services/password-service';
import { Argon2PasswordService } from './infrastructure/services/argon2.password-service';
import { JwtAuthGuard } from './application/guards/jwt.guard';
import { AuthService } from './application/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './application/guards/auth.guard';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/http/auth.controller';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { CaslAbilityFactory } from './application/casl/casl-ability.factory';
import { CaslAuthGuard } from './application/guards/casl-auth.guard';

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  providers: [
    {
      provide: PASSWORD_SERVICE,
      useClass: Argon2PasswordService,
    },
    AuthService,
    JwtAuthGuard,
    AuthGuard,
    JwtStrategy,
    CaslAbilityFactory,
    CaslAuthGuard,
  ],
  exports: [
    PASSWORD_SERVICE,
    AuthGuard,
    JwtAuthGuard,
    CaslAbilityFactory,
    CaslAuthGuard,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
