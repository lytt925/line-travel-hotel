import { Module } from '@nestjs/common';
import { CsvParserService } from './';

@Module({
  providers: [CsvParserService],
  exports: [CsvParserService],
})
export class CsvParserModule {}
