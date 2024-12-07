import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '../../common/errors';
import { LoginResponseDto } from '../dtos/responses/login-res.dto';
import { RefreshResponseDto } from '../dtos/responses/refresh-res.dto';

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiOkResponse({
      description: 'User logged in successfully',
      type: LoginResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Bad request parameters',
      type: BadRequestException,
      example: {
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      type: NotFoundException,
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedException,
      example: {
        message: 'Wrong password',
        error: 'Unauthorized',
        statusCode: 401,
      },
    }),
  );
}

export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh token' }),
    ApiCookieAuth(),
    ApiOkResponse({
      description: 'Token refreshed successfully',
      type: RefreshResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedException,
      examples: {
        expired: {
          summary: 'Token expired',
          value: {
            message: 'Token expired',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
        invalid: {
          summary: 'Invalid token',
          value: {
            message: 'Invalid token',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
        notoken: {
          summary: 'No token provided',
          value: {
            message: 'No refresh token provided',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
  );
}
