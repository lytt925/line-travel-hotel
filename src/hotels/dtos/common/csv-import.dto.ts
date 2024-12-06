import { ApiProperty } from '@nestjs/swagger';

class ImportError {
  @ApiProperty({
    description: 'The row number where the error occurred',
    example: 2,
  })
  row: number;

  @ApiProperty({
    description: 'List of error messages',
    example: ['Error message'],
  })
  errors: string[];
}

class ImportRecord {
  @ApiProperty({
    description: 'The row number of a successful record',
    example: 1,
  })
  row: number;
}

export class ImportResult {
  @ApiProperty({
    description: 'Array of successfully imported records',
    type: [ImportRecord],
    example: [{ row: 1 }],
  })
  successRecords: ImportRecord[];

  @ApiProperty({
    description: 'Array of records with import errors',
    type: [ImportError],
    example: [{ row: 2, errors: ['Error message'] }],
  })
  errorRecords: ImportError[];
}
