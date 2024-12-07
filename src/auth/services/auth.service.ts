import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JWT_EXPIRATION, JWT_REFRESH_EXPIRATION } from '../utils/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  JWT_SECRET = this.configService.get('JWT_SECRET');
  JWT_REFRESH_SECRET = this.configService.get('JWT_REFRESH_SECRET');

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: JWT_EXPIRATION,
        secret: this.JWT_SECRET,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: JWT_REFRESH_EXPIRATION,
        secret: this.JWT_REFRESH_SECRET,
      }),
    };
  }

  async issueTokenByRefreshToken(refreshToken: string): Promise<string> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.JWT_REFRESH_SECRET,
    });
    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      lastName: payload.lastName,
      firstName: payload.firstName,
    };
    return await this.jwtService.signAsync(newPayload);
  }
}
