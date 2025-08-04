import pino from 'pino';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmConfig } from './database/orm-config';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/application/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: () => {
        return {
          ...createTypeOrmConfig(),
          autoLoadEntities: true,
        };
      },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            name: 'deskbird-api',
            genReqId: function (req, res) {
              const existingID = req.id ?? req.headers['x-request-id'];

              if (existingID) return existingID;

              const id = crypto.randomUUID();
              res.setHeader('X-Request-Id', id);

              return id;
            },
            level: config.get<string>('LOG_LEVEL') ?? 'debug',
            formatters: {
              level: (label) => {
                return { level: label.toUpperCase() };
              },
            },
            transport:
              config.get<string>('NODE_ENV') !== 'production'
                ? { target: 'pino-pretty' }
                : undefined,
            timestamp: pino.stdTimeFunctions.isoTime,
            redact: ['req.headers.authorization'],
            autoLogging:
              config.get<string>('AUTOLOG_REQ_RES_ENABLED') === 'true',
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
