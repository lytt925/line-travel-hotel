import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dtos/base-response.dto';
import { UserPublicDto } from '../common/user-public.dto';

export class PublicUserResDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Create Hotel Message',
    example: 'Hotel created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Hotel data',
    type: UserPublicDto,
  })
  data: UserPublicDto;
}
