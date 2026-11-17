import { Role } from '../../../shared/enums/role.enum.js';
import { UserModel } from '../models/user.model.js';

/** O que sai para o cliente — nunca a entity crua (evita vazar senha/colunas internas). */
export class UserGetResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: Role;
  active: boolean;
  createdAt: Date;

  static from(u: UserModel): UserGetResponseDto {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      cpf: u.cpf,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt,
    };
  }
}
