import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

/** Email e senha têm fluxos próprios; aqui só dados de perfil. */
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email', 'password'] as const)) {}
