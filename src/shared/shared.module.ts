import { Global, Module } from '@nestjs/common';
import { CepRepository } from './repositories/cep.repository.js';
import { S3Repository } from './repositories/s3.repository.js';
import { SendgridRepository } from './repositories/sendgrid.repository.js';
import { ZenviaRepository } from './repositories/zenvia.repository.js';

/** Integrações externas do shared, disponíveis para qualquer módulo sem reimportar. */
const repositories = [S3Repository, CepRepository, SendgridRepository, ZenviaRepository];

@Global()
@Module({ providers: repositories, exports: repositories })
export class SharedModule {}
