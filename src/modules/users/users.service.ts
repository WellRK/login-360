import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PaginateResultDto } from '../../common/dto/paginate-result.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { MaskUtil } from '../../common/utils/mask.util.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserEntity } from './user.entity.js';
import { UsersRepository } from './users.repository.js';

export const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async create(dto: CreateUserDto, role: Role = Role.USER): Promise<UserEntity> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.existsByEmail(email)) throw new ConflictException('email já cadastrado');

    const cpf = dto.cpf ? MaskUtil.onlyDigits(dto.cpf) : null;
    if (cpf && (await this.users.existsByCpf(cpf))) throw new ConflictException('cpf já cadastrado');

    return this.users.save({
      name: dto.name.trim(),
      email,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      phone: dto.phone ? MaskUtil.onlyDigits(dto.phone) : null,
      cpf,
      role,
    });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.users.getById(id);
    if (!user) throw new NotFoundException('usuário não encontrado');
    return user;
  }

  async me(id: string): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.findById(id));
  }

  async list(take: number, skip: number): Promise<PaginateResultDto<UserResponseDto>> {
    const page = await this.users.listPaginate(take, skip);
    return new PaginateResultDto(page.result.map((u) => UserResponseDto.from(u)), page.count);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id);
    const data: Partial<UserEntity> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.phone !== undefined) data.phone = dto.phone ? MaskUtil.onlyDigits(dto.phone) : null;
    if (dto.cpf !== undefined) {
      const cpf = dto.cpf ? MaskUtil.onlyDigits(dto.cpf) : null;
      if (cpf && (await this.users.existsByCpf(cpf, id))) throw new ConflictException('cpf já cadastrado');
      data.cpf = cpf;
    }
    if (Object.keys(data).length) await this.users.update(id, data);
    return this.me(id);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.users.getByIdWithPassword(id);
    if (!user) throw new NotFoundException('usuário não encontrado');
    if (!(await bcrypt.compare(dto.currentPassword, user.password)))
      throw new BadRequestException('senha atual incorreta');
    await this.users.update(id, { password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS) });
  }

  async setActive(id: string, active: boolean): Promise<UserResponseDto> {
    await this.findById(id);
    await this.users.update(id, { active });
    return this.me(id);
  }

  async remove(id: string): Promise<boolean> {
    if (!(await this.users.softDelete(id))) throw new NotFoundException('usuário não encontrado');
    return true;
  }
}
