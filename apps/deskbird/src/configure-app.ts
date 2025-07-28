import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { ApiVersion } from './api_versions';
import { ConfigService } from '@nestjs/config';

const setupUncaughtErrorHandling = (logger: Logger) => {
  process.on('uncaughtException', (err: Error) => {
    logger.fatal('There was an uncaught error', err, err.stack);
    process.exit(1); //mandatory (as per the Node.js docs)
  });
  process.on('unhandledRejection', (err: Error) => {
    logger.fatal('There was an uncaught error', err, err.stack);
    process.exit(1); //mandatory (as per the Node.js docs)
  });
};

const setupSwagger = (app: INestApplication) => {
  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('Users API')
      .addBearerAuth()
      .addServer('http://')
      .addServer('https://')
      .setDescription('API for managing users')
      .setVersion('1.0.0')
      .build();

    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, options));
  }
};

const setupCors = (app: INestApplication) => {
  app.enableCors({
    // TODO: replace with whitelist of domains
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
};

const setupSecurity = (
  app: INestApplication<any>,
  configService: ConfigService<unknown, boolean>,
) => {
  setupCors(app);

  const requestsLimit = configService.get<number>('REQUESTS_PER_MINUTE') ?? 0;

  if (requestsLimit > 0) {
    app.use(
      rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: requestsLimit,
      }),
    );
  }

  app.use(helmet());
};

export function configure(app: INestApplication) {
  const configService = app.get(ConfigService);

  setupSwagger(app);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ApiVersion.V1,
    prefix: 'v',
  });

  setupSecurity(app, configService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const logger = app.get(Logger);
  app.useLogger(logger);

  setupUncaughtErrorHandling(logger);
}
