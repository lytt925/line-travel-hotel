import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
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
    required: false,
  })
  data?: unknown;
}
