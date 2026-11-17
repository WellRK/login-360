import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser, JwtPayload } from '../../../common/interfaces/jwt-payload.interface.js';
import { UsersRepository } from '../../users/users.repository.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly users: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  /** Diferente do 360: confere no banco se o usuário ainda existe e está ativo. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.users.getById(payload.sub);
    if (!user || !user.active) throw new UnauthorizedException('usuário inativo ou removido');
    // role vem do banco, não do token: mudar papel vale na hora
    return { userId: user.id, email: user.email, role: user.role };
  }
}
