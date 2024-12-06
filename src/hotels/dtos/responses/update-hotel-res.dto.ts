import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dtos/base-response.dto';

export class UpdateResponseDto implements BaseResponseDto {
  @ApiProperty({
    description: 'Update Hotel Message',
    example: 'Hotel updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Status code',
    example: 200,
  })
  statusCode: number;
}
