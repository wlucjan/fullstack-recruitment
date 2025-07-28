import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  configure(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
