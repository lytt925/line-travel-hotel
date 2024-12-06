import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateResponseDto,
  GetAllResponseDto,
  GetByIdResponseDto,
  UpdateResponseDto,
  CreateHotelDto,
  UpdateHotelDto,
  ImportResponseDto,
} from '../dtos';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/errors/base.error';

export function ApiGetById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a hotel by ID' }),
    ApiOkResponse({
      description: 'Hotel found successfully',
      type: GetByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Hotel with ID {id} not found',
      type: NotFoundException,
      example: {
        statusCode: 404,
        message: 'Hotel with ID 1 not found',
        error: 'Not Found',
      },
    }),
  );
}

export function ApiGetAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all hotels' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiOkResponse({
      description: 'Hotels found successfully',
      type: GetAllResponseDto,
    }),
  );
}

export function ApiCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a hotel' }),
    ApiBody({
      description: 'Hotel data',
      type: CreateHotelDto,
    }),
    ApiCreatedResponse({
      description: 'Hotel created successfully',
      type: CreateResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid hotel data',
      type: BadRequestException,
      example: {
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      },
    }),
  );
}

export function ApiImportFromCsv() {
  return applyDecorators(
    ApiOperation({ summary: 'Import hotels from CSV file' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Upload a CSV file',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Hotels import result',
      type: ImportResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid CSV file',
      type: BadRequestException,
      example: {
        statusCode: 400,
        message: 'Invalid CSV file',
        error: 'Bad Request',
      },
    }),
  );
}

export function ApiUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a hotel by ID' }),
    ApiBody({
      description: 'Hotel data',
      type: UpdateHotelDto,
    }),
    ApiOkResponse({
      description: 'Hotel updated successfully',
      type: UpdateResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Hotel with ID {id} not found',
      type: NotFoundException,
      example: {
        statusCode: 404,
        message: 'Hotel with ID 1 not found',
        error: 'Not Found',
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid hotel data',
      type: BadRequestException,
      example: {
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      },
    }),
  );
}
