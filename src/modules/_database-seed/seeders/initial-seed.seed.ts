import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../shared/enums/role.enum.js';
import { UserRepository } from '../../user/repositories/user.repository.js';
import { UserService } from '../../user/services/user.service.js';

/** Comando: seed:database (npm run seed). Idempotente: pode rodar mais de uma vez. */
@Injectable()
export class InitialSeed {
  private readonly _logger = new Logger(InitialSeed.name);

  constructor(
    private readonly _configService: ConfigService,
    private readonly _userRepository: UserRepository,
    private readonly _userService: UserService,
  ) {}

  async seed(): Promise<void> {
    this._logger.log('start seed');
    await this._seedAdmin();
    this._logger.log('seed finished');
  }

  /** Admin inicial a partir de ADMIN_EMAIL / ADMIN_PASSWORD. */
  private async _seedAdmin(): Promise<void> {
    const email = this._configService.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this._configService.get<string>('ADMIN_PASSWORD');
    if (!email || !password) throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env');

    if (await this._userRepository.existsByEmail(email)) {
      this._logger.log(`admin ${email} já existe`);
      return;
    }
    await this._userService.register({ name: 'Administrador', email, password }, Role.ADMIN);
    this._logger.log(`admin ${email} criado`);
  }
}
