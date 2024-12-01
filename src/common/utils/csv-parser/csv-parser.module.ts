import { Module } from '@nestjs/common';
import { CsvParserService } from './csv-parser.service';

@Module({
  providers: [CsvParserService],
  exports: [CsvParserService], // Export the service for use in other modules
})
export class CsvParserModule {}
