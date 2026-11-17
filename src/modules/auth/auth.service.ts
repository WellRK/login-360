import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { UserEntity } from '../users/user.entity.js';
import { UsersRepository } from '../users/users.repository.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';

// Hash de uma senha qualquer: compara mesmo quando o email não existe,
// para o tempo de resposta não revelar quais emails estão cadastrados.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.users.getByEmailWithPassword(dto.email);
    const ok = await bcrypt.compare(dto.password, user?.password ?? DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException('email ou senha inválidos');
    if (!user.active) throw new UnauthorizedException('usuário inativo');
    return this.issueToken(user);
  }

  async register(dto: CreateUserDto): Promise<LoginResponseDto> {
    const user = await this.usersService.create(dto);
    return this.issueToken(user);
  }

  private async issueToken(user: UserEntity): Promise<LoginResponseDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      expiresIn: this.config.getOrThrow<string | number>('jwt.expiresIn'),
      user: UserResponseDto.from(user),
    };
  }
}
