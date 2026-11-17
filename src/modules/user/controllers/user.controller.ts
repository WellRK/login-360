import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../shared/decorators/roles.decorator.js';
import { PaginateQueryDto } from '../../../shared/dtos/paginate-query.dto.js';
import { Role } from '../../../shared/enums/role.enum.js';
import type { AuthUser } from '../../../shared/interfaces/jwt-payload.interface.js';
import { UserChangePasswordRequestDto } from '../dtos/user-change-password-request.dto.js';
import { UserUpdateRequestDto } from '../dtos/user-update-request.dto.js';
import { UserService } from '../services/user.service.js';

/** Retorno é embrulhado em ResponseDto pelo ResponseInterceptor; erros pelo HttpExceptionFilter. */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this._userService.getById(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UserUpdateRequestDto) {
    return this._userService.update(user.userId, dto);
  }

  @Patch('me/password')
  @HttpCode(200)
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: UserChangePasswordRequestDto) {
    await this._userService.changePassword(user.userId, dto);
    return true;
  }

  // ---- admin ----

  @Get()
  @Roles(Role.ADMIN)
  list(@Query() q: PaginateQueryDto) {
    return this._userService.listPaginate(q.take, q.skip);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this._userService.getById(id);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this._userService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this._userService.setActive(id, false);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this._userService.delete(id);
  }
}
