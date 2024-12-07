import { LoginResponseDto } from './login-res.dto';
import { OmitType } from '@nestjs/swagger';

export class RefreshResponseDto extends OmitType(LoginResponseDto, [
  'user',
] as const) {}
