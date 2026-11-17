import { Module } from '@nestjs/common';
import { DatabaseModule } from '../_database/database.module.js';
import { UserModule } from '../user/user.module.js';
import { InitialSeed } from './seeders/initial-seed.seed.js';

@Module({
  imports: [DatabaseModule, UserModule],
  providers: [InitialSeed],
  exports: [InitialSeed],
})
export class DatabaseSeedModule {}
