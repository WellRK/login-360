import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'homologation', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsInt()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string = '*';

  @IsBooleanString()
  ENABLE_DOCS: string = 'true';

  @IsString() @IsNotEmpty() DB_HOST: string;
  @IsInt() DB_PORT: number = 5432;
  @IsString() @IsNotEmpty() DB_NAME: string;
  @IsString() @IsNotEmpty() DB_USER: string;
  @IsString() DB_PASSWORD: string;

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET precisa ter pelo menos 32 caracteres' })
  JWT_SECRET: string;

  /** Segundos (3600) ou formato ms ('1h', '7d'). */
  @IsString() @IsNotEmpty()
  JWT_EXPIRATION: string = '1d';

  @IsOptional() @IsString() ADMIN_EMAIL?: string;
  @IsOptional() @IsString() ADMIN_PASSWORD?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const msg = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n  - ');
    throw new Error(`Variáveis de ambiente inválidas:\n  - ${msg}`);
  }
  return validated;
}
