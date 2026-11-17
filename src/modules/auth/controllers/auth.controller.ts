import { Body, Controller, ForbiddenException, Get, HttpCode, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Public } from '../../../shared/decorators/public.decorator.js';
import type { AuthUser } from '../../../shared/interfaces/jwt-payload.interface.js';
import { UserRegisterRequestDto } from '../../user/dtos/user-register-request.dto.js';
import { AuthenticateRequestDto } from '../dtos/authenticate-request.dto.js';
import { AuthService } from '../services/auth.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // 5 tentativas/min por IP
  @Post('login')
  @HttpCode(200)
  authenticate(@Body() dto: AuthenticateRequestDto) {
    return this._authService.authenticate(dto);
  }

  /** Só funciona com ALLOW_REGISTER=true. */
  @Public()
  @Throttle({ default: { ttl: 60 * 60_000, limit: 5 } }) // 5 cadastros/hora por IP
  @Post('register')
  register(@Body() dto: UserRegisterRequestDto) {
    if (!this._configService.get<boolean>('allowRegister')) throw new ForbiddenException('cadastro público desabilitado');
    return this._authService.register(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
