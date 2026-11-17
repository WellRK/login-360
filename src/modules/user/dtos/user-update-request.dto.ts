import { OmitType, PartialType } from '@nestjs/swagger';
import { UserRegisterRequestDto } from './user-register-request.dto.js';

/** Email e senha têm fluxos próprios; aqui só dados de perfil. */
export class UserUpdateRequestDto extends PartialType(OmitType(UserRegisterRequestDto, ['email', 'password'] as const)) {}
