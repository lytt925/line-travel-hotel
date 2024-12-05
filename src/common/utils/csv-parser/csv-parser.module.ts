import { Module } from '@nestjs/common';
import { CsvParserService } from './csv-parser.service';

@Module({
  providers: [CsvParserService],
  exports: [CsvParserService],
})
export class CsvParserModule {}
