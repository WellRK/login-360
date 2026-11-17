import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import { UserModel } from '../models/user.model.js';

@Injectable()
export class UserRepository extends BaseRepository<UserModel> {
  constructor(
    @InjectRepository(UserModel)
    protected readonly _model: Repository<UserModel>,
  ) {
    super(_model);
  }

  getByEmail(email: string): Promise<UserModel | null> {
    return this._model.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  /** Única consulta que traz o hash da senha — usar só no login/troca de senha. */
  getByEmailWithPassword(email: string): Promise<UserModel | null> {
    return this._model
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  getByIdWithPassword(id: string): Promise<UserModel | null> {
    return this._model.createQueryBuilder('u').addSelect('u.password').where('u.id = :id', { id }).getOne();
  }

  existsByEmail(email: string): Promise<boolean> {
    return this._model.exists({ where: { email: email.trim().toLowerCase() } });
  }

  existsByCpf(cpf: string, exceptId?: string): Promise<boolean> {
    const qb = this._model.createQueryBuilder('u').where('u.cpf = :cpf', { cpf });
    if (exceptId) qb.andWhere('u.id <> :exceptId', { exceptId });
    return qb.getExists();
  }
}
