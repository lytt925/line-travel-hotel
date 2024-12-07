import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PublicUserResDto } from '../dto/responses/user-public-res.dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../common/errors';

export function ApiGetById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by ID' }),
    ApiOkResponse({
      description: 'User found successfully',
      type: PublicUserResDto,
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
  );
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a user' }),
    ApiOkResponse({
      description: 'User created successfully',
      type: PublicUserResDto,
    }),
    ApiConflictResponse({
      description: 'Email already exists',
      type: ConflictException,
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
      example: {
        message: ['email must be an email', 'password is not strong enough'],
        error: 'Bad Request',
        statusCode: 400,
      },
    }),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a user' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User updated',
      type: PublicUserResDto,
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
    ApiConflictResponse({
      description: 'Email already exists',
      type: ConflictException,
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ForbiddenException,
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    }),
  );
}
