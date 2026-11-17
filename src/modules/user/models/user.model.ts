import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from '../../../shared/model/base.model.js';
import { Role } from '../../../shared/enums/role.enum.js';

/** Schema "app": tabelas do produto, migradas só por este projeto. */
@Entity({ name: 'users', schema: 'app' })
export class UserModel extends BaseModel {
  @Column({ length: 100 })
  name: string;

  /** Sempre gravado em minúsculas (ver UserService). Único só entre não deletados. */
  @Index('uq_users_email', { unique: true, where: '"deleted_at" IS NULL' })
  @Column({ length: 255 })
  email: string;

  /** Hash bcrypt. select:false = nunca vem em find() por acidente. */
  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Index('uq_users_cpf', { unique: true, where: '"cpf" IS NOT NULL AND "deleted_at" IS NULL' })
  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: true })
  active: boolean;
}
