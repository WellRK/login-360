import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entitiesConfig } from './entities.config.js';

/** Conexão usada pela aplicação (lê do ConfigService). */
export const databaseAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: config.getOrThrow<string>('db.host'),
    port: config.get<number>('db.port', 5432),
    database: config.getOrThrow<string>('db.name'),
    username: config.getOrThrow<string>('db.user'),
    password: config.get<string>('db.password'),
    entities: entitiesConfig,
    migrationsTableName: 'migrations',
    migrations: [`${import.meta.dirname}/../migrations/*.js`],
    migrationsRun: false,
    synchronize: false, // schema só muda por migration
  }),
};
