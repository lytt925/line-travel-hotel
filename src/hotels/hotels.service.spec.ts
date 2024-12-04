import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { CsvParserService } from '../common/utils/csv-parser/csv-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dtos/requests/create-hotel.dto';

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

const mockHotelData: Hotel = {
  id: 1,
  name: 'Mock Hotel',
  address: '123 Example Street, Taipei',
  email: 'mockhotel@example.com',
  status: 1,
  coordinate: '120.332,25.252',
  webLink: 'https://mockhotel.com',
};

const mockCreateHotelDto: CreateHotelDto = {
  name: 'Hotel A',
  country: '台灣',
  city: '台北',
  address: '中山區',
  email: 'ytli@gmai.com',
  is_open: true,
  longitude: 121.54409,
  latitude: 25.0485,
};

describe('HotelsService', () => {
  let service: HotelsService;
  let hotelsRepository: jest.Mocked<Repository<Hotel>>;
  let csvParser: jest.Mocked<CsvParserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        {
          provide: getRepositoryToken(Hotel),
          useValue: mockHotelsRepository(),
        },
        {
          provide: CsvParserService,
          useValue: mockCsvParserService(),
        },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    hotelsRepository = module.get(getRepositoryToken(Hotel));
    csvParser = module.get(CsvParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all hotels', async () => {
      hotelsRepository.find.mockResolvedValue([mockHotelData]);
      const result = await service.findAll();
      expect(result).toEqual([mockHotelData]);
      expect(hotelsRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create and return a new hotel', async () => {
      const mockHotel = {
        ...mockHotelData,
        name: mockCreateHotelDto.name,
        address: `${mockCreateHotelDto.address},${mockCreateHotelDto.city},${mockCreateHotelDto.country}`,
        email: mockCreateHotelDto.email,
        status: mockCreateHotelDto.is_open ? 1 : 0,
        coordinate: `${mockCreateHotelDto.latitude},${mockCreateHotelDto.longitude}`,
      };
      hotelsRepository.create.mockReturnValue(mockHotel);
      hotelsRepository.save.mockResolvedValue(mockHotel);

      const result = await service.create(mockCreateHotelDto);
      expect(result).toEqual(mockHotel);
      expect(hotelsRepository.create).toHaveBeenCalledWith(expect.any(Object));
      expect(hotelsRepository.save).toHaveBeenCalledWith(mockHotel);
    });
  });

  describe('importFromFile', () => {
    it('should process the file and import hotels', async () => {
      const mockFile = {
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,is_open
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,true
          礁溪老爺酒店102,五峰路69號,https://fake-hotels.com,台灣,宜蘭,12.776,24.671,true
        `),
      } as Express.Multer.File;
      const mockRecords = [
        {
          name: '礁溪老爺酒店101',
          address: '五峰路69號',
          email: 'ytlit.wt@gami.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '24.671',
          is_open: 'true',
        },
        {
          name: '礁溪老爺酒店102',
          address: '五峰路69號',
          email: 'https://fake-hotels.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '24.671',
          is_open: 'true',
        },
      ];

      csvParser.parseCsvFromBuffer.mockResolvedValue(mockRecords);
      hotelsRepository.insert.mockResolvedValue({} as any);

      const result = await service.importFromFile(mockFile);
      expect(result.successRecords.length).toBe(1);
      expect(result.errorRecords.length).toBe(1);
      expect(csvParser.parseCsvFromBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
      );
      expect(hotelsRepository.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a hotel by id', async () => {
      hotelsRepository.findOne.mockResolvedValue(mockHotelData);
      const result = await service.findOne(1);
      expect(result).toEqual(mockHotelData);
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update and return true if the hotel exists', async () => {
      hotelsRepository.findOne.mockResolvedValue(mockHotelData);
      hotelsRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, { name: 'Hotel B' });
      expect(result).toBe(true);
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(hotelsRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return null if the hotel does not exist', async () => {
      hotelsRepository.findOne.mockResolvedValue(null);

      const result = await service.update(1, { name: 'Hotel B' });
      expect(result).toBeNull();
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('remove', () => {
    it('should delete a hotel and return true', async () => {
      hotelsRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);
      expect(result).toBe(true);
      expect(hotelsRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return false if no hotel was deleted', async () => {
      hotelsRepository.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await service.remove(1);
      expect(result).toBe(false);
      expect(hotelsRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
