import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseAsyncConfig } from './config/database.config.js';
import { entitiesConfig } from './config/entities.config.js';

/**
 * Padrão do 360: registra a conexão e todos os models de entitiesConfig.
 * Módulos de feature importam DatabaseModule e já podem usar @InjectRepository(Model).
 */
@Module({
  imports: [TypeOrmModule.forRootAsync(databaseAsyncConfig), TypeOrmModule.forFeature(entitiesConfig)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
