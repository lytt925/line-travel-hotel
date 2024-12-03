import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dtos/requests/create-hotel.dto';
import { UpdateHotelDto } from './dtos/requests/update-hotel.dto';
import { merge } from 'lodash';
import { CsvParserService } from '../common/utils/csv-parser/csv-parser.service';
import {
  mapCreateHotelDtoToEntity,
  mapEntityToCreateHotelDto,
} from './mappers/hotel.mapper';
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

  async findAll(): Promise<Hotel[]> {
    return await this.hotelsRepository.find();
  }

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = this.hotelsRepository.create(
      mapCreateHotelDtoToEntity(createHotelDto),
    );
    return await this.hotelsRepository.save(hotel);
  }

  async importFromFile(file: Express.Multer.File): Promise<ImportResult> {
    const records = await this.csvParser.parseCsvFromBuffer(file.buffer);
    const hotelsToInsert = [];
    const importResult: ImportResult = {
      successRecords: [],
      errorRecords: [],
    };

    const mappingPromises = records.map(async (record, index) => {
      try {
        const hotel = await mapRecordToCreateHotelDto(record);
        hotelsToInsert.push(hotel);
        importResult.successRecords.push({
          row: index + 1,
        });
      } catch (error) {
        importResult.errorRecords.push({
          row: index + 1,
          errors: error.map((e: ValidationError) =>
            Object.values(e.constraints).join('; '),
          ),
        });
      }
    });

    await Promise.all(mappingPromises);
    await this.hotelsRepository.insert(
      hotelsToInsert.map((h) => mapCreateHotelDtoToEntity(h)),
    );
    return importResult;
  }

  async findOne(id: number): Promise<Hotel | null> {
    return await this.hotelsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateHotelDto: UpdateHotelDto): Promise<boolean> {
    const hotel = await this.findOne(id);
    if (!hotel) {
      return null;
    }
    const transformedHotel = mapEntityToCreateHotelDto(hotel);
    const updatedHotel = merge(transformedHotel, updateHotelDto);
    const updatedEntity = mapCreateHotelDtoToEntity(updatedHotel);
    const result = await this.hotelsRepository.update({ id }, updatedEntity);
    return result.affected === 1;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.hotelsRepository.delete({ id });
    return result.affected === 1;
  }
}
