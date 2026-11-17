import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginateQueryDto } from '../../common/dto/paginate-query.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/interfaces/jwt-payload.interface.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.me(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.users.update(user.userId, dto);
  }

  @Patch('me/password')
  @HttpCode(200)
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    await this.users.changePassword(user.userId, dto);
    return true;
  }

  // ---- admin ----

  @Get()
  @Roles(Role.ADMIN)
  list(@Query() q: PaginateQueryDto) {
    return this.users.list(q.take, q.skip);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.me(id);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.setActive(id, false);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.remove(id);
  }
}
