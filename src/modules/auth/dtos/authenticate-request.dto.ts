import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class AuthenticateRequestDto {
  @ApiProperty({ example: 'admin@exemplo.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @ApiProperty({ example: 'TroqueEssaSenha123' })
  @IsString()
  @MaxLength(72)
  password: string;
}
