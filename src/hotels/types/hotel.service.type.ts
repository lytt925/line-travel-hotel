import { CreateHotelDto } from '../dtos/requests/create-hotel.dto';

export interface ImportError {
  recordIndex: number;
  errors: string[];
}

export interface ImportResult {
  hotels: CreateHotelDto[];
  errorRecords: ImportError[];
}
