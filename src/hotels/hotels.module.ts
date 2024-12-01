import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { CsvParserModule } from '../common/utils/csv-parser/csv-parser.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel]), CsvParserModule],
  providers: [HotelsService],
  controllers: [HotelsController],
})
export class HotelsModule {}
