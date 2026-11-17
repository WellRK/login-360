import { ConfigService } from '@nestjs/config';
import type { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

/** Config do JwtModule a partir do .env (padrão do 360: shared/factories). */
export const jwtFactory: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService): JwtModuleOptions => ({
    secret: config.getOrThrow<string>('jwt.secret'),
    signOptions: { expiresIn: config.getOrThrow('jwt.expiresIn') },
  }),
};
