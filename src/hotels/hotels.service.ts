import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { merge } from 'lodash';
import { CsvParserService } from '../common/utils/csv-parser/csv-parser.service';
import { mapCreateHotelDtoToEntity } from './mappers/hotel.mapper';
import { mapRecordToCreateHotelDto } from './mappers/dto.mapper';
import { ValidationError } from 'class-validator';
import { ImportResult } from './types/hotel.service.type';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    private csvParser: CsvParserService,
  ) {}

  async findAll() {
    return await this.hotelsRepository.find();
  }

  async create(createHotelDto: CreateHotelDto) {
    const hotel = this.hotelsRepository.create(
      mapCreateHotelDtoToEntity(createHotelDto),
    );
    return await this.hotelsRepository.save(hotel);
  }

  async importFromFile(file: Express.Multer.File) {
    const records = await this.csvParser.parseCsvFromBuffer(file.buffer);
    const importResults: ImportResult = {
      hotels: [],
      errorRecords: [],
    };

    const mappingPromises = records.map(async (record, index) => {
      try {
        const hotel = await mapRecordToCreateHotelDto(record);
        importResults.hotels.push(hotel);
      } catch (error) {
        importResults.errorRecords.push({
          recordIndex: index + 1,
          errors: error.map((e: ValidationError) =>
            Object.values(e.constraints).join('; '),
          ),
        });
      }
    });

    await Promise.all(mappingPromises);
    await this.hotelsRepository.insert(
      importResults.hotels.map((h) => mapCreateHotelDtoToEntity(h)),
    );
    return importResults;
  }

  async findOne(id: number): Promise<Hotel | null> {
    return await this.hotelsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateHotelDto: UpdateHotelDto) {
    const hotel = await this.findOne(id);
    if (!hotel) {
      return null;
    }

    const updatedHotel = merge(hotel, updateHotelDto);
    return await this.hotelsRepository.save(updatedHotel);
  }

  async remove(id: number) {
    const result = await this.hotelsRepository.delete({ id });
    return result.affected === 1;
  }
}
