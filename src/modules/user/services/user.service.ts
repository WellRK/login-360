import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PaginateResultDto } from '../../../shared/dtos/paginate-result.dto.js';
import { Role } from '../../../shared/enums/role.enum.js';
import { MaskUtil } from '../../../shared/utils/mask.util.js';
import { UserChangePasswordRequestDto } from '../dtos/user-change-password-request.dto.js';
import { UserGetResponseDto } from '../dtos/user-get-response.dto.js';
import { UserRegisterRequestDto } from '../dtos/user-register-request.dto.js';
import { UserUpdateRequestDto } from '../dtos/user-update-request.dto.js';
import { UserModel } from '../models/user.model.js';
import { UserRepository } from '../repositories/user.repository.js';

export const BCRYPT_ROUNDS = 12;

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  async register(dto: UserRegisterRequestDto, role: Role = Role.USER): Promise<UserModel> {
    const email = dto.email.trim().toLowerCase();
    if (await this._userRepository.existsByEmail(email)) throw new ConflictException('email já cadastrado');

    const cpf = dto.cpf ? MaskUtil.onlyDigits(dto.cpf) : null;
    if (cpf && (await this._userRepository.existsByCpf(cpf))) throw new ConflictException('cpf já cadastrado');

    return this._userRepository.save({
      name: dto.name.trim(),
      email,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      phone: dto.phone ? MaskUtil.onlyDigits(dto.phone) : null,
      cpf,
      role,
    });
  }

  async findById(id: string): Promise<UserModel> {
    const user = await this._userRepository.getById(id);
    if (!user) throw new NotFoundException('usuário não encontrado');
    return user;
  }

  async getById(id: string): Promise<UserGetResponseDto> {
    return UserGetResponseDto.from(await this.findById(id));
  }

  async listPaginate(take: number, skip: number): Promise<PaginateResultDto<UserGetResponseDto>> {
    const page = await this._userRepository.listPaginate(take, skip);
    return new PaginateResultDto(page.result.map((u) => UserGetResponseDto.from(u)), page.count);
  }

  async update(id: string, dto: UserUpdateRequestDto): Promise<UserGetResponseDto> {
    await this.findById(id);
    const data: Partial<UserModel> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.phone !== undefined) data.phone = dto.phone ? MaskUtil.onlyDigits(dto.phone) : null;
    if (dto.cpf !== undefined) {
      const cpf = dto.cpf ? MaskUtil.onlyDigits(dto.cpf) : null;
      if (cpf && (await this._userRepository.existsByCpf(cpf, id))) throw new ConflictException('cpf já cadastrado');
      data.cpf = cpf;
    }
    if (Object.keys(data).length) await this._userRepository.update(id, data);
    return this.getById(id);
  }

  async changePassword(id: string, dto: UserChangePasswordRequestDto): Promise<void> {
    const user = await this._userRepository.getByIdWithPassword(id);
    if (!user) throw new NotFoundException('usuário não encontrado');
    if (!(await bcrypt.compare(dto.currentPassword, user.password)))
      throw new BadRequestException('senha atual incorreta');
    await this._userRepository.update(id, { password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS) });
  }

  async setActive(id: string, active: boolean): Promise<UserGetResponseDto> {
    await this.findById(id);
    await this._userRepository.update(id, { active });
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    if (!(await this._userRepository.softDelete(id))) throw new NotFoundException('usuário não encontrado');
    return true;
  }
}
