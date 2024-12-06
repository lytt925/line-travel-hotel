import { HttpExceptionBody } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export class NotFoundException implements HttpExceptionBody {
  @ApiProperty({
    description: 'Error message',
  })
  message: HttpExceptionBody['message'];

  @ApiProperty({
    description: StatusCodes.NOT_FOUND.toString(),
    example: StatusCodes.NOT_FOUND,
  })
  statusCode: HttpExceptionBody['statusCode'];

  @ApiProperty({
    description: ReasonPhrases.NOT_FOUND,
    example: ReasonPhrases.NOT_FOUND,
  })
  error?: HttpExceptionBody['error'];
}

export class BadRequestException implements HttpExceptionBody {
  @ApiProperty({
    description: 'Error message',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: HttpExceptionBody['message'];

  @ApiProperty({
    description: StatusCodes.BAD_REQUEST.toString(),
    example: StatusCodes.BAD_REQUEST,
  })
  statusCode: HttpExceptionBody['statusCode'];

  @ApiProperty({
    description: ReasonPhrases.BAD_REQUEST,
    example: ReasonPhrases.BAD_REQUEST,
  })
  error?: HttpExceptionBody['error'];
}
