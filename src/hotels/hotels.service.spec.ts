import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { CsvParserService } from '../common/utils/csv-parser/csv-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dtos/requests/create-hotel.dto';

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

  describe('findAll', () => {
    it('should return all hotels', async () => {
      hotelsRepository.find.mockResolvedValue([mockHotel]);
      const result = await service.findAll();
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
  });

  describe('importFromFile', () => {
    it('should process the file and import hotels', async () => {
      const mockFile = {
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen,webLink
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,0,
          礁溪老爺酒店102,五峰路69號,https://fake-hotels.com,台灣,宜蘭,12.776,24.671,1,https://hotel.com
        `),
      } as Express.Multer.File;
      const mockRecords: Record<string, string>[] = [
        {
          name: '礁溪老爺酒店101',
          address: '五峰路69號',
          email: 'ytlit.wt@gami.com',
          country: '台灣',
          city: '宜蘭',
          longitude: '121.776',
          latitude: '24.671',
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
          latitude: '24.671',
          isOpen: '1',
          webLink: 'https://hotel.com',
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
      hotelsRepository.findOne.mockResolvedValue(mockHotel);
      const result = await service.findOne(1);
      expect(result).toEqual(mockHotel);
      expect(hotelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update and return true if the hotel exists', async () => {
      hotelsRepository.findOne.mockResolvedValue(mockHotel);
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
});
