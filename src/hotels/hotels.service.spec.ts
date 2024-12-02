import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { CsvParserModule } from '../common/utils/csv-parser/csv-parser.module';

describe('HotelsService', () => {
  let service: HotelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CsvParserModule],
      providers: [HotelsService],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
