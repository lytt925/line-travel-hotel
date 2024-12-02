import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from '../types/responses.type';

export class BaseResponseDto<T> implements ApiResponse<T> {
  @ApiProperty({
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    description: 'Response status code',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response data',
  })
  data?: T;
}
