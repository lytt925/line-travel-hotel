import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  CreateResponseDto,
  DeleteResponseDto,
  GetAllResponseDto,
  GetByIdResponseDto,
  ImportResponseDto,
  UpdateResponseDto,
} from '../dtos/responses/responses.dto';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/docs/base.error';
import { UpdateHotelDto } from '../dtos/requests/update-hotel.dto';
import { CreateHotelDto } from '../dtos/requests/create-hotel.dto';

export function ApiGetById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a hotel by ID' }),
    ApiOkResponse({
      description: 'Hotel found successfully',
      type: GetByIdResponseDto,
      example: {
        statusCode: 200,
        message: 'Hotel found successfully',
        data: {
          id: 4,
          name: '礁溪老爺酒店',
          webLink: null,
          address: '五峰路69號',
          email: 'hotel@hotel.com',
          status: 1,
          coordinate: '24.671,121.776',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Hotel with ID {id} not found',
      type: NotFoundException,
    }),
  );
}

export function ApiGetAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all hotels' }),
    ApiOkResponse({
      description: 'Hotels found successfully',
      type: GetAllResponseDto,
      example: {
        statusCode: 200,
        message: 'Hotels found successfully',
        data: [
          {
            id: 3,
            name: '礁溪老爺酒店2',
            webLink: null,
            address: '五峰路69號',
            email: 'hotel2@hotel.com',
            status: 1,
            coordinate: '24.671,121.776',
          },
          {
            id: 4,
            name: '礁溪老爺酒店',
            webLink: 'https://hotel.com',
            address: '五峰路69號',
            email: 'hotel3@gmail.com',
            status: 1,
            coordinate: '24.671,121.776',
          },
        ],
      },
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
    ApiOkResponse({
      description: 'Hotel created successfully',
      type: CreateResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid hotel data',
      type: BadRequestException,
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
      example: {
        statusCode: 200,
        message: 'Hotel updated successfully',
        data: {
          id: 4,
          name: '礁溪老爺酒店',
          webLink: 'https://hotel.com',
          address: '五峰路69號,宜蘭,台灣',
          email: 'ytli.1tw@gmail.com',
          status: 1,
          coordinate: '35,121.776',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Hotel with ID {id} not found',
      type: NotFoundException,
    }),
    ApiBadRequestResponse({
      description: 'Invalid hotel data',
      type: BadRequestException,
    }),
  );
}

export function ApiDelete() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a hotel by ID' }),
    ApiOkResponse({
      description: 'Hotel deleted successfully',
      type: DeleteResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Hotel with ID {id} not found',
      type: NotFoundException,
    }),
  );
}