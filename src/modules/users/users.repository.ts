import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { UserEntity } from './user.entity.js';

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  constructor(@InjectRepository(UserEntity) repo: Repository<UserEntity>) {
    super(repo);
  }

  getByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  /** Única consulta que traz o hash da senha — usar só no login/troca de senha. */
  getByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  getByIdWithPassword(id: string): Promise<UserEntity | null> {
    return this.repo.createQueryBuilder('u').addSelect('u.password').where('u.id = :id', { id }).getOne();
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.repo.exists({ where: { email: email.trim().toLowerCase() } });
  }

  existsByCpf(cpf: string, exceptId?: string): Promise<boolean> {
    const qb = this.repo.createQueryBuilder('u').where('u.cpf = :cpf', { cpf });
    if (exceptId) qb.andWhere('u.id <> :exceptId', { exceptId });
    return qb.getExists();
  }

  async update(id: string, data: Partial<UserEntity>): Promise<void> {
    await this.repo.update(id, data);
  }
}
