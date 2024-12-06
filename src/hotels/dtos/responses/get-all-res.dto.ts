import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dtos/base-response.dto';
import { Hotel } from '../../entities/hotel.entity';

export class GetAllData {
  @ApiProperty({
    description: 'List of hotels',
    type: [Hotel],
  })
  hotels: Hotel[];

  @ApiProperty({
    description: 'Total number of hotels',
    example: 1,
  })
  page: number;
}

export class GetAllResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Get All Hotels Message',
    example: 'Hotels found successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'List of hotels',
    type: GetAllData,
  })
  data: GetAllData;
}
