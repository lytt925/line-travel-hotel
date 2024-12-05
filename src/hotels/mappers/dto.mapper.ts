import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateHotelDto } from '../dtos/requests/create-hotel.dto';

export async function mapRecordToCreateHotelDto(
  record: Record<string, any>,
): Promise<CreateHotelDto> {
  try {
    if (record.isOpen !== '1' && record.isOpen !== '0') {
      const error = new ValidationError();
      error.property = 'isOpen';
      error.constraints = {
        isIn: 'isOpen must be either 1 or 0',
      };
      error.value = record.isOpen;
      throw [error];
    } else {
      record.isOpen = record.isOpen === '1';
    }

    const createDto = plainToInstance(CreateHotelDto, record, {
      enableImplicitConversion: true,
    });

    await validateOrReject(createDto, {
      whitelist: true,
    });

    return createDto;
  } catch (error) {
    throw error;
  }
}
