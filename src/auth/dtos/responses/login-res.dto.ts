import { JwtPayload } from '../common/jwt.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: JwtPayload,
  })
  user: JwtPayload;
}
