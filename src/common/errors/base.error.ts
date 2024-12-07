import { ApiProperty } from '@nestjs/swagger';
import { HttpExceptionBody } from '@nestjs/common';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export class HttpExceptionDto implements HttpExceptionBody {
  @ApiProperty({
    description: 'Error message',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: HttpExceptionBody['message'];

  @ApiProperty({
    description: 'Status code',
    example: 400,
  })
  statusCode: HttpExceptionBody['statusCode'];

  @ApiProperty({
    description: 'Error phrase',
    example: 'Bad Request',
  })
  error?: HttpExceptionBody['error'];
}

export class NotFoundException extends HttpExceptionDto {
  @ApiProperty({
    description: StatusCodes.NOT_FOUND.toString(),
    example: StatusCodes.NOT_FOUND,
  })
  statusCode = StatusCodes.NOT_FOUND;

  @ApiProperty({
    description: ReasonPhrases.NOT_FOUND,
    example: ReasonPhrases.NOT_FOUND,
  })
  error = ReasonPhrases.NOT_FOUND;
}

export class UnauthorizedException extends HttpExceptionDto {
  @ApiProperty({
    description: StatusCodes.UNAUTHORIZED.toString(),
    example: StatusCodes.UNAUTHORIZED,
  })
  statusCode = StatusCodes.UNAUTHORIZED;

  @ApiProperty({
    description: ReasonPhrases.UNAUTHORIZED,
    example: ReasonPhrases.UNAUTHORIZED,
  })
  error = ReasonPhrases.UNAUTHORIZED;
}

export class BadRequestException extends HttpExceptionDto {
  @ApiProperty({
    description: StatusCodes.BAD_REQUEST.toString(),
    example: StatusCodes.BAD_REQUEST,
  })
  statusCode = StatusCodes.BAD_REQUEST;

  @ApiProperty({
    description: ReasonPhrases.BAD_REQUEST,
    example: ReasonPhrases.BAD_REQUEST,
  })
  error = ReasonPhrases.BAD_REQUEST;
}

export class ConflictException extends HttpExceptionDto {
  @ApiProperty({
    description: StatusCodes.CONFLICT.toString(),
    example: StatusCodes.CONFLICT,
  })
  statusCode = StatusCodes.CONFLICT;

  @ApiProperty({
    description: ReasonPhrases.CONFLICT,
    example: ReasonPhrases.CONFLICT,
  })
  error = ReasonPhrases.CONFLICT;
}

export class ForbiddenException extends HttpExceptionDto {
  @ApiProperty({
    description: StatusCodes.FORBIDDEN.toString(),
    example: StatusCodes.FORBIDDEN,
  })
  statusCode = StatusCodes.FORBIDDEN;

  @ApiProperty({
    description: ReasonPhrases.FORBIDDEN,
    example: ReasonPhrases.FORBIDDEN,
  })
  error = ReasonPhrases.FORBIDDEN;
}
