import { applyDecorators } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetById() {
  return applyDecorators(ApiOperation({ summary: 'Get user by ID' }));
}
