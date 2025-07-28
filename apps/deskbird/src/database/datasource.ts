import { DataSource } from 'typeorm';
import { createTypeOrmConfig } from './orm-config';

export default new DataSource(createTypeOrmConfig());
