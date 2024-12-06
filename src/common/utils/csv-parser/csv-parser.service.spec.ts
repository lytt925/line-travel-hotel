import { Test, TestingModule } from '@nestjs/testing';
import { CsvParserService } from './';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvParserService],
    }).compile();

    service = module.get<CsvParserService>(CsvParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse CSV from buffer and return records', async () => {
    const buffer = Buffer.from(`name,age,city
John,30,New York
Jane,25,Los Angeles`);

    const expectedResult = [
      { name: 'John', age: '30', city: 'New York' },
      { name: 'Jane', age: '25', city: 'Los Angeles' },
    ];

    const result = await service.parseCsvFromBuffer(buffer);

    expect(result).toEqual(expectedResult);
  });

  it('should return an empty array for an empty CSV', async () => {
    const buffer = Buffer.from('');

    const result = await service.parseCsvFromBuffer(buffer);

    expect(result).toEqual([]);
  });

  it('should skip empty lines in the CSV', async () => {
    const csvData = `name,age,city

John,30,New York

Jane,25,Los Angeles

`;
    const buffer = Buffer.from(csvData);

    const expectedResult = [
      { name: 'John', age: '30', city: 'New York' },
      { name: 'Jane', age: '25', city: 'Los Angeles' },
    ];

    const result = await service.parseCsvFromBuffer(buffer);

    expect(result).toEqual(expectedResult);
  });
});
