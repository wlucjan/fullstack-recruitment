import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure } from './configure-app';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  configure(app);
  const logger = app.get(Logger);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Api started on port: ${port}`, 'InstanceLoader');
}

bootstrap();
