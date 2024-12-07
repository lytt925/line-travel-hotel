import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    const payload = {
      userId: user.id,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '2m',
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    };
  }

  async issueTokenByRefreshToken(refreshToken: string): Promise<string> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      lastName: payload.lastName,
      firstName: payload.firstName,
    };
    return this.jwtService.sign(newPayload);
  }
}
