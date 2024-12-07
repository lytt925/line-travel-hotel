import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'email',
    example: 'user1@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'password',
    example: 'Password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
