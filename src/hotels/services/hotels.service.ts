import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { HotelEntity } from '../entities/hotel.orm-entity';
import { CreateHotelDto, UpdateHotelDto, ImportResult } from '../dtos';
import { merge } from 'lodash';
import { CsvParserService } from '../../common/utils/csv-parser/csv-parser.service';
import { mapRecordToCreateHotelDto } from '../mappers/dto.mapper';
import { ValidationError } from 'class-validator';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelsRepository: Repository<HotelEntity>,
    private csvParser: CsvParserService,
  ) {}

  async findAll(page: number): Promise<HotelEntity[]> {
    const take = 10;
    const skip = (page - 1) * take;
    return await this.hotelsRepository.find({
      skip,
      take,
    });
  }

  async create(createHotelDto: CreateHotelDto): Promise<HotelEntity> {
    const existingHotel = await this.hotelsRepository.findOne({
      where: { name: createHotelDto.name },
    });
    if (existingHotel) {
      throw new ConflictException('Hotel name already exists');
    }

    const hotel = this.hotelsRepository.create(createHotelDto);
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

    try {
      await Promise.all(mappingPromises);
      await this.hotelsRepository.insert(hotelsToInsert);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('Duplicate')
      ) {
        throw new ConflictException('Duplicate hotel name');
      }
      throw new InternalServerErrorException('Failed to import hotels');
    }
    return importResult;
  }

  async findOne(id: number): Promise<HotelEntity> {
    const hotel = await this.hotelsRepository.findOne({ where: { id } });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
  }

  async update(
    id: number,
    updateHotelDto: UpdateHotelDto,
  ): Promise<HotelEntity> {
    const hotel = await this.findOne(id);
    const updatedHotel = merge(hotel, updateHotelDto);
    await this.hotelsRepository.update(hotel, updatedHotel);
    return updatedHotel;
  }
}
