import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelEntity } from './entities/hotel.orm-entity';
import { HotelsService } from './services';
import { HotelsController } from './controllers';
import { CsvParserModule } from '../common/utils/csv-parser';
import { ResponsePresenter } from '../common/presenters/response.presenter';

@Module({
  imports: [TypeOrmModule.forFeature([HotelEntity]), CsvParserModule],
  providers: [HotelsService, ResponsePresenter],
  controllers: [HotelsController],
})
export class HotelsModule {}
