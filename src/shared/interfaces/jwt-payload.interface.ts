import { Role } from '../enums/role.enum.js';

/** O que vai dentro do token. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/** O que fica em request.user depois do guard (use com @CurrentUser()). */
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}
