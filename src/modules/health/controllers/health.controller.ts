import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { Public } from '../../../shared/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly _dataSource: DataSource) {}

  @Public()
  @SkipThrottle() // healthcheck do Docker/balanceador chama sem parar
  @Get()
  async check() {
    await this._dataSource.query('SELECT 1');
    return { status: 'ok', db: 'ok' };
  }
}
