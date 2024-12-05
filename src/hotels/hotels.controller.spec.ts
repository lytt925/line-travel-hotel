import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { ResponsePresenter } from '../common/presenters/response.presenter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dtos/requests/create-hotel.dto';
import { ImportResult } from './types/hotel.service.type';
import { CsvError } from 'csv-parse';

describe('HotelsController', () => {
  let controller: HotelsController;

  const mockHotelsData: Hotel[] = [
    {
      id: 1,
      name: 'Mock Hotel',
      country: 'Taiwan',
      city: 'Taipei',
      address: '123 Example Street',
      email: 'mockhotel@example.com',
      isOpen: true,
      webLink: 'https://mockhotel.com',
      longitude: '121.5',
      latitude: '25.0',
    },
  ];

  const mockHotelsService = {
    findAll: jest.fn(() => mockHotelsData),
    findOne: jest.fn((id: number) =>
      id === 1 ? mockHotelsData.find((hotel) => hotel.id === 1) : null,
    ),
    create: jest.fn((dto): CreateHotelDto => ({ id: 2, ...dto })),
    update: jest.fn((id: number, dto: CreateHotelDto) =>
      id === 1 ? { id, ...dto } : null,
    ),
    importFromFile: jest.fn<Promise<ImportResult>, []>(),
  };

  const mockResponsePresenter = {
    formatSuccessResponse: jest.fn((message, data) => ({ message, data })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        { provide: HotelsService, useValue: mockHotelsService },
        { provide: ResponsePresenter, useValue: mockResponsePresenter },
      ],
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
  });

  describe('findAll', () => {
    it('should return all hotels', async () => {
      const result = await controller.findAll();
      expect(mockHotelsService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Hotels found successfully',
        data: mockHotelsData,
      });
    });
  });

  describe('findOne', () => {
    it('should return a hotel by ID', async () => {
      const result = await controller.findOne(1);
      expect(mockHotelsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Hotel found successfully',
        data: mockHotelsData.find((hotel) => hotel.id === 1),
      });
    });

    it('should throw NotFoundException if hotel not found', async () => {
      await expect(controller.findOne(200)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a hotel', async () => {
      const createHotelDto: CreateHotelDto = {
        name: 'New Hotel',
        country: 'Taiwan',
        city: 'Taipei',
        address: '123 Street',
        email: 'hotel@hotel.com',
        isOpen: true,
        longitude: '121.5',
        latitude: '25.0',
      };
      const result = await controller.create(createHotelDto);
      expect(mockHotelsService.create).toHaveBeenCalledWith(createHotelDto);
      expect(result).toEqual({
        message: 'Hotel created successfully',
        data: { id: 2, ...createHotelDto },
      });
    });
  });

  describe('update', () => {
    it('should update a hotel', async () => {
      const updateHotelDto = { name: 'Updated Hotel' };
      const result = await controller.update(1, updateHotelDto);
      expect(mockHotelsService.update).toHaveBeenCalledWith(1, updateHotelDto);
      expect(result).toEqual({
        message: 'Hotel updated successfully',
      });
    });

    it('should throw NotFoundException if hotel to update is not found', async () => {
      const updateHotelDto = { name: 'Updated Hotel' };
      await expect(controller.update(2, updateHotelDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('importFromFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      size: 1024,
      buffer: Buffer.from(`
        name,address,email,country,city,longitude,latitude,is_open
        礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,true
        `),
      destination: '',
      filename: '',
      path: '',
      stream: null,
    };

    it('should import hotels successfully', async () => {
      const mockImportResults: ImportResult = {
        successRecords: [
          {
            row: 1,
          },
        ],
        errorRecords: [],
      };

      mockHotelsService.importFromFile.mockResolvedValue(mockImportResults);

      const result = await controller.importFromFile(mockFile);

      expect(mockHotelsService.importFromFile).toHaveBeenCalledWith(mockFile);
      expect(mockResponsePresenter.formatSuccessResponse).toHaveBeenCalledWith(
        'Hotels imported successfully',
        mockImportResults,
      );
      expect(result).toEqual({
        message: 'Hotels imported successfully',
        data: mockImportResults,
      });
    });

    it('should handle import with errors', async () => {
      const mockPartialErrorFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,is_open
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,true
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,94.671,true
        `),
      };

      const mockImportResults = {
        successRecords: [
          {
            row: 1,
          },
        ],
        errorRecords: [
          {
            row: 2,
            errors: ['latitude must not be greater than 90'],
          },
        ],
      };

      mockHotelsService.importFromFile.mockResolvedValue(mockImportResults);

      const result = await controller.importFromFile(mockPartialErrorFile);

      expect(mockHotelsService.importFromFile).toHaveBeenCalledWith(
        mockPartialErrorFile,
      );
      expect(mockResponsePresenter.formatSuccessResponse).toHaveBeenCalledWith(
        'Hotels imported with errors',
        mockImportResults,
      );
      expect(result).toEqual({
        message: 'Hotels imported with errors',
        data: mockImportResults,
      });
    });

    it('should throw BadRequestException on CsvError', async () => {
      const mockCsvErrorFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,is_open
          礁溪老爺酒店101,五峰路69號ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,true
        `),
      };

      const mockCsvError = new CsvError(
        'CSV_RECORD_INCONSISTENT_COLUMNS',
        'Invalid CSV',
      );
      mockHotelsService.importFromFile.mockRejectedValue(mockCsvError);

      await expect(controller.importFromFile(mockCsvErrorFile)).rejects.toThrow(
        BadRequestException,
      );

      const internalServerError = new Error('Internal Server Error');
      mockHotelsService.importFromFile.mockRejectedValue(internalServerError);

      await expect(controller.importFromFile(mockFile)).rejects.toThrow(
        internalServerError,
      );
    });
  });
});
