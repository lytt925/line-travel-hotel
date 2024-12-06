import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from './';
import { HotelsService } from '../services';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { BadRequestException } from '@nestjs/common';
import { Hotel } from '../entities/hotel.entity';
import { CreateHotelDto, ImportResult, UpdateHotelDto } from '../dtos';
import { CsvError } from 'csv-parse';

describe('HotelsController', () => {
  let controller: HotelsController;
  let responsePresenter: ResponsePresenter;

  const mockHotelsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    importFromFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        { provide: HotelsService, useValue: mockHotelsService },
        ResponsePresenter,
      ],
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
    responsePresenter = module.get<ResponsePresenter>(ResponsePresenter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockHotelsData: Hotel[] = [
    {
      id: 1,
      name: 'Mock Hotel',
      country: 'Taiwan',
      city: 'Taipei',
      address: '123 Example Street',
      email: 'test@gmail.com',
      isOpen: true,
      webLink: 'https://mockhotel.com',
      latitude: '25.0',
      longitude: '121.5',
    },
  ];
  describe('findAll', () => {
    const mockPage = 1;
    it('should return paginated hotels', async () => {
      mockHotelsService.findAll.mockResolvedValue(mockHotelsData);
      const result = await controller.findAll(mockPage);
      expect(mockHotelsService.findAll).toHaveBeenCalledWith(mockPage);
      expect(result).toEqual({
        message: 'Hotels found successfully',
        data: {
          hotels: mockHotelsData,
          page: mockPage,
        },
      });
    });

    it('should give page 1 if page is not provided', async () => {
      mockHotelsService.findAll.mockResolvedValue(mockHotelsData);
      const result = await controller.findAll();
      expect(mockHotelsService.findAll).toHaveBeenCalledWith(mockPage);
      expect(result).toEqual({
        message: 'Hotels found successfully',
        data: {
          hotels: mockHotelsData,
          page: mockPage,
        },
      });
    });

    it('should give bad request', async () => {
      const mockPage = 0;
      await expect(controller.findAll(mockPage)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a hotel by ID', async () => {
      const mockFindHotel = mockHotelsData.find((hotel) => hotel.id === 1);
      mockHotelsService.findOne.mockResolvedValue(mockFindHotel);
      const result = await controller.findOne(1);
      expect(mockHotelsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Hotel found successfully',
        data: mockFindHotel,
      });
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
      mockHotelsService.create.mockResolvedValue({ id: 2, ...createHotelDto });
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
      const updateHotelDto: UpdateHotelDto = { name: 'Updated Hotel' };
      const mockUpdatedHotel = { ...mockHotelsData[0], ...updateHotelDto };
      mockHotelsService.update.mockResolvedValue(mockUpdatedHotel);
      const result = await controller.update(1, updateHotelDto);
      expect(mockHotelsService.update).toHaveBeenCalledWith(1, updateHotelDto);
      expect(result).toEqual({
        message: 'Hotel updated successfully',
        data: mockUpdatedHotel,
      });
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
        name,address,email,country,city,longitude,latitude,isOpen
        礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1
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
      const spyOnFormatSuccessResponse = jest.spyOn(
        responsePresenter,
        'formatSuccessResponse',
      );
      const result = await controller.importFromFile(mockFile);

      expect(mockHotelsService.importFromFile).toHaveBeenCalledWith(mockFile);
      expect(spyOnFormatSuccessResponse).toHaveBeenCalledWith(
        'Hotels imported successfully',
        mockImportResults,
      );
      expect(result).toEqual({
        message: 'Hotels imported successfully',
        data: mockImportResults,
      });
    });

    it('should handle import with partial errors', async () => {
      const mockPartialErrorFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,94.671,0
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
      const spyOnFormatSuccessResponse = jest.spyOn(
        responsePresenter,
        'formatSuccessResponse',
      );
      const result = await controller.importFromFile(mockPartialErrorFile);

      expect(mockHotelsService.importFromFile).toHaveBeenCalledWith(
        mockPartialErrorFile,
      );
      expect(spyOnFormatSuccessResponse).toHaveBeenCalledWith(
        'Some records failed to import',
        mockImportResults,
      );
      expect(result).toEqual({
        message: 'Some records failed to import',
        data: mockImportResults,
      });
    });

    it('should throw BadRequestException on empty file', async () => {
      const mockEmptyFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from(''),
      };
      mockHotelsService.importFromFile.mockResolvedValue({
        successRecords: [],
        errorRecords: [],
      });
      await expect(controller.importFromFile(mockEmptyFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('No records successfully imported', async () => {
      const mockNoImportFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen
          礁溪老爺酒店101,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,94.671,0 
        `),
      };

      const mockImportResults = {
        successRecords: [],
        errorRecords: [
          {
            row: 1,
            errors: ['latitude must not be greater than 90'],
          },
        ],
      };

      mockHotelsService.importFromFile.mockResolvedValue(mockImportResults);
      await expect(controller.importFromFile(mockNoImportFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on CsvError', async () => {
      const mockCsvErrorFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from(`
          name,address,email,country,city,longitude,latitude,isOpen
          礁溪老爺酒店101,五峰路69號,
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
    });
  });
});
