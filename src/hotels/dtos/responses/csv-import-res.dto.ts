import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dtos/base-response.dto';
import { ImportResult } from '../common/csv-import.dto';

export class ImportResponseDto implements BaseResponseDto {
  @ApiProperty({
    description: 'Message',
    example: 'Imported successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({ description: 'Import result', type: ImportResult })
  data: ImportResult;
}
