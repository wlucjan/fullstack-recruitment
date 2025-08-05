import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeederService } from './seeder.service';
import { Logger } from '@nestjs/common';

async function runSeeder() {
  const logger = new Logger('Seeder');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seederService = app.get(SeederService);

    await seederService.seed();
    await app.close();

    logger.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
}

runSeeder();
