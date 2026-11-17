import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface.js';
import { UserGetResponseDto } from '../../user/dtos/user-get-response.dto.js';
import { UserRegisterRequestDto } from '../../user/dtos/user-register-request.dto.js';
import { UserModel } from '../../user/models/user.model.js';
import { UserRepository } from '../../user/repositories/user.repository.js';
import { UserService } from '../../user/services/user.service.js';
import { AuthenticateRequestDto } from '../dtos/authenticate-request.dto.js';
import { AuthenticateResponseDto } from '../dtos/authenticate-response.dto.js';

// Hash de uma senha qualquer: compara mesmo quando o email não existe,
// para o tempo de resposta não revelar quais emails estão cadastrados.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);

@Injectable()
export class AuthService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _userService: UserService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  async authenticate(dto: AuthenticateRequestDto): Promise<AuthenticateResponseDto> {
    const user = await this._userRepository.getByEmailWithPassword(dto.email);
    const ok = await bcrypt.compare(dto.password, user?.password ?? DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException('email ou senha inválidos');
    if (!user.active) throw new UnauthorizedException('usuário inativo');
    return this.issueToken(user);
  }

  async register(dto: UserRegisterRequestDto): Promise<AuthenticateResponseDto> {
    const user = await this._userService.register(dto);
    return this.issueToken(user);
  }

  private async issueToken(user: UserModel): Promise<AuthenticateResponseDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this._jwtService.signAsync(payload),
      expiresIn: this._configService.getOrThrow<string | number>('jwt.expiresIn'),
      user: UserGetResponseDto.from(user),
    };
  }
}
