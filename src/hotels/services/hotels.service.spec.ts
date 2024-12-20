import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './';
import { CsvParserService } from '../../common/utils/csv-parser/csv-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Hotel } from '../entities/hotel.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateHotelDto } from '../dtos';
import { HotelEntity } from '../entities/hotel.orm-entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockCreateHotelDto: CreateHotelDto = {
  name: 'Mock Hotel',
  country: 'Taiwan',
  city: 'Taipei',
  address: '123 Example Street',
  email: 'mockhotel@example.com',
  isOpen: true,
  webLink: 'https://mockhotel.com',
  longitude: '121.5',
  latitude: '25.0',
};

const mockHotel: Hotel = {
  id: 1,
  ...mockCreateHotelDto,
};

const mockHotelsRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockCsvParserService = () => ({
  parseCsvFromBuffer: jest.fn(),
});

describe('HotelsService', () => {
  let service: HotelsService;
  let hotelsRepository: jest.Mocked<Repository<HotelEntity>>;
  let csvParser: jest.Mocked<CsvParserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        {
          provide: getRepositoryToken(HotelEntity),
          useValue: mockHotelsRepository(),
        },
        {
          provide: CsvParserService,
          useValue: mockCsvParserService(),
        },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    hotelsRepository = module.get(getRepositoryToken(HotelEntity));
    csvParser = module.get(CsvParserService);
  });

  describe('findAll', () => {
    it('should return all hotels', async () => {
      hotelsRepository.find.mockResolvedValue([mockHotel]);
      const result = await service.findAll(1);
      expect(result).toEqual([mockHotel]);
      expect(hotelsRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create and return a new hotel', async () => {
      hotelsRepository.create.mockReturnValue(mockHotel);
      hotelsRepository.save.mockResolvedValue(mockHotel);

      const result = await service.create(mockCreateHotelDto);
      expect(result).toEqual(mockHotel);
      expect(hotelsRepository.create).toHaveBeenCalledWith(expect.any(Object));
      expect(hotelsRepository.save).toHaveBeenCalledWith(mockHotel);
    });

    it('should throw conflict exception if hotel name exists', async () => {
      hotelsRepository.findOne.mockResolvedValue(mockHotel);
      await expect(service.create(mockCreateHotelDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('importFromFile', () => {
    it('should give error imports', async () => {
      const mockFile = {
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen,webLink
          礁溪老爺酒店101,五峰路69號,https://fake-hotels.com,台灣,宜蘭,12.776,94.671,0,
          礁溪老爺酒店102,五峰路69號,https://fake-hotels.com,台灣,宜蘭,12.776,24.671,true,https://hotel.com
          礁溪老爺酒店103,五峰路69號,yt@gami.com,台灣,宜蘭,12.776,24.671,0,https://hotel.com
        `),
      } as Express.Multer.File;
      const mockRecords: Record<string, string>[] = [
        {
          name: '礁溪老爺酒店101',
          address: '五峰路69號',
          email: 'https://fake-hotels.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '94.671',
          isOpen: '0',
          webLink: '',
        },
        {
          name: '礁溪老爺酒店102',
          address: '五峰路69號',
          email: 'https://fake-hotels.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '94.671',
          isOpen: 'true',
          webLink: 'https://hotel.com',
        },
        {
          name: '礁溪老爺酒店103',
          address: '五峰路69號',
          email: 'yt@gami.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '24.671',
          isOpen: '1',
          webLink: 'https://hotel.com',
        },
      ];

      csvParser.parseCsvFromBuffer.mockResolvedValue(mockRecords);
      hotelsRepository.insert.mockResolvedValue({} as any);

      const result = await service.importFromFile(mockFile);
      expect(result.successRecords.length).toBe(1);
      expect(result.errorRecords.length).toBe(2);
      expect(csvParser.parseCsvFromBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
      );
      expect(hotelsRepository.insert).toHaveBeenCalledTimes(1);
    });

    it('should throw error if hotel name exists', async () => {
      const mockFile = {
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen,webLink
          礁溪老爺酒店101,五峰路69號,mail@mail.com,台灣,宜蘭,12.776,24.671,0,
          礁溪老爺酒店101,五峰路69號,mail@mail.com,台灣,宜蘭,12.776,24.671,0,`),
      } as Express.Multer.File;
      const mockRecords: Record<string, string>[] = [
        {
          name: '礁溪老爺酒店101',
          address: '五峰路69號',
          email: 'https://fake-hotels.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '94.671',
          isOpen: '0',
          webLink: '',
        },
        {
          name: '礁溪老爺酒店101',
          address: '五峰路69號',
          email: 'https://fake-hotels.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '24.671',
          isOpen: '0',
          webLink: '',
        },
      ];
      csvParser.parseCsvFromBuffer.mockResolvedValue(mockRecords);
      hotelsRepository.insert.mockRejectedValue(
        new QueryFailedError('query', [], Error('Duplicate hotel name')),
      );
      expect(service.importFromFile(mockFile)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw error if hotel name exists', async () => {
      const mockFile = {
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen,webLink
          礁溪老爺酒店101,五峰路69號,mail@mail.com,台灣,宜蘭,12.776,24.671,0,`),
      } as Express.Multer.File;
      const mockRecords: Record<string, string>[] = [
        {
          name: '礁溪老爺酒店101',
          address: '五峰路69號',
          email: 'https://fake-hotels.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '94.671',
          isOpen: '0',
          webLink: '',
        },
      ];
      csvParser.parseCsvFromBuffer.mockResolvedValue(mockRecords);
      hotelsRepository.insert.mockRejectedValue(Error);
      expect(service.importFromFile(mockFile)).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a hotel by id', async () => {
      hotelsRepository.findOne.mockResolvedValue(mockHotel);
      const result = await service.findOne(1);
      expect(result).toEqual(mockHotel);
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update and return updated hotel', async () => {
      hotelsRepository.findOne.mockResolvedValue(mockHotel);
      const result = await service.update(1, { name: 'Hotel B' });
      expect(hotelsRepository.update).toHaveBeenCalledWith(mockHotel, {
        ...mockHotel,
        name: 'Hotel B',
      });
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ ...mockHotel, name: 'Hotel B' });
    });

    it('should throw error if the hotel does not exist', async () => {
      hotelsRepository.findOne.mockResolvedValue(null);
      expect(service.update(1, { name: 'Hotel B' })).rejects.toThrow(
        NotFoundException,
      );
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
