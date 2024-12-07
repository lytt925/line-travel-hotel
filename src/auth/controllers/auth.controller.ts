import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from '../dtos/signIn.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { TokenExpiredError } from '@nestjs/jwt';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
    private readonly responseRepresenter: ResponsePresenter,
  ) {}

  @Post('login')
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto,
  ) {
    const { access_token, refresh_token } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.configService.get('NODE_ENV') === 'production',
    });

    return this.responseRepresenter.formatSuccessResponse(
      'Logged in successfully',
      { access_token },
    );
  }
  @Post('refresh')
  @HttpCode(200)
  async refreshAccessToken(@Req() req: Request) {
    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const new_access_token =
        await this.authService.issueTokenByRefreshToken(refresh_token);

      return this.responseRepresenter.formatSuccessResponse(
        'Access token refreshed successfully',
        { access_token: new_access_token },
      );
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
