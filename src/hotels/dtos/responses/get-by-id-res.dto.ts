import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dtos/base-response.dto';
import { Hotel } from '../../entities/hotel.entity';

export class GetByIdResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Get Hotel Message',
    example: 'Hotel found successfully',
  })
  message: string;
  @ApiProperty({
    description: 'Status code',
    example: 200,
  })
  statusCode: number;
  @ApiProperty({
    description: 'Hotel data',
    type: Hotel,
  })
  data: Hotel;
}
