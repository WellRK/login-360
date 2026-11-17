import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { IsCpf } from '../../../common/decorators/is-cpf.decorator.js';
import { PHONE_BR_REGEX } from '../../../common/utils/validators.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Silva' })
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'maria@exemplo.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'email inválido' })
  @MaxLength(255)
  email: string;

  /** Mínimo 8 caracteres, com pelo menos uma letra e um número. */
  @ApiProperty({ example: 'Senha1234', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // limite do bcrypt
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, { message: 'senha precisa ter letras e números' })
  password: string;

  @ApiPropertyOptional({ example: '(11) 98888-8888' })
  @IsOptional()
  @Matches(PHONE_BR_REGEX, { message: 'telefone inválido' })
  phone?: string;

  @ApiPropertyOptional({ example: '529.982.247-25' })
  @IsOptional()
  @IsCpf()
  cpf?: string;
}
