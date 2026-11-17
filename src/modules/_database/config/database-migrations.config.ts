import { DataSource } from 'typeorm';
import { entitiesConfig } from './entities.config.js';

/** DataSource da CLI do TypeORM (sobre o build em dist/): npm run migration:run */
try {
  process.loadEnvFile('.env');
} catch {
  /* sem .env: usa variáveis do ambiente */
}

// a CLI do TypeORM exige exatamente um export de DataSource no arquivo
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: entitiesConfig,
  migrationsTableName: 'migrations',
  migrations: [`${import.meta.dirname}/../migrations/*.js`],
  synchronize: false,
});
