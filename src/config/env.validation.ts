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
  ENABLE_DOCS: string = 'false';

  /** Cadastro público em /auth/register. Desligado por padrão (SaaS: convite/admin até ter tenants). */
  @IsBooleanString()
  ALLOW_REGISTER: string = 'false';

  /** Nº de proxies na frente (nginx/traefik) para o req.ip do throttler ser o IP real. 0 = sem proxy. */
  @IsInt()
  TRUST_PROXY: number = 0;

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

  @IsOptional() @IsString() AWS_REGION?: string;
  @IsOptional() @IsString() AWS_ACCESS_KEY_ID?: string;
  @IsOptional() @IsString() AWS_SECRET_ACCESS_KEY?: string;
  @IsOptional() @IsString() SENDGRID_API_KEY?: string;
  @IsOptional() @IsString() SENDGRID_EMAIL_SENDER?: string;
  @IsOptional() @IsString() ZENVIA_TOKEN?: string;
  @IsOptional() @IsString() ZENVIA_EMAIL?: string;
  @IsOptional() @IsString() ZENVIA_SMS_FROM?: string;
  @IsOptional() @IsString() CEP_API?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  const msgs = errors.map((e) => Object.values(e.constraints ?? {}).join(', '));
  if (validated.NODE_ENV === 'production' && validated.CORS_ORIGINS.split(',').some((o) => o.trim() === '*'))
    msgs.push('CORS_ORIGINS="*" não é permitido em produção (liste as origens do frontend)');
  if (msgs.length > 0) {
    const msg = msgs.join('\n  - ');
    throw new Error(`Variáveis de ambiente inválidas:\n  - ${msg}`);
  }
  return validated;
}
