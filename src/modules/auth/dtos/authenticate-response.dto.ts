import { UserGetResponseDto } from '../../user/dtos/user-get-response.dto.js';

export class AuthenticateResponseDto {
  accessToken: string;
  expiresIn: string | number;
  user: UserGetResponseDto;
}
