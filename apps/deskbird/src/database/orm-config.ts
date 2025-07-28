import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ quiet: true });

const isTest = process.env.NODE_ENV === 'test';

export const createTypeOrmConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  logging: !isTest && process.env.TYPEORM_LOGGING === 'true',
  migrationsRun: true,
  synchronize: isTest,
  entities: isTest
    ? [path.join(__dirname, '..', '**', '*.entity.ts')]
    : undefined, // Let `autoLoadEntities` handle it outside test
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
});
