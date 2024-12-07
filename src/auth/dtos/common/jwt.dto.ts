import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  userId: number;
  @ApiProperty({
    description: 'User email',
    example: 'test@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'YT',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Li',
  })
  lastName: string;
}
