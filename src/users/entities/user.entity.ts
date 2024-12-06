import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Yen-Ting',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Li',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'ytli.tw@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: '123456',
  })
  password?: string;
}
