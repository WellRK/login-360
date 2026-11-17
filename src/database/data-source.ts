import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../modules/users/user.entity.js';

export const entities = [UserEntity];

export function buildDataSourceOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 5432),
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    entities,
    migrations: [`${import.meta.dirname}/migrations/*.js`],
    migrationsTableName: 'migrations',
    synchronize: false, // schema só muda por migration
  };
}

// Usado pela CLI do TypeORM (sobre o build em dist/): npm run migration:run
try {
  process.loadEnvFile('.env');
} catch {
  /* sem .env: usa variáveis do ambiente */
}
export default new DataSource(buildDataSourceOptions());
