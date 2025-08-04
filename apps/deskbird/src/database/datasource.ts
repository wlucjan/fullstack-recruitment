import { DataSource } from 'typeorm';
import { createTypeOrmConfig } from './orm-config';
import * as path from 'path';

export default new DataSource({
  ...createTypeOrmConfig(),
  entities: [path.join(__dirname, '..', '**', '*.entity.ts')],
});
