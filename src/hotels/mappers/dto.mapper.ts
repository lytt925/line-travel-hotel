import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateHotelDto } from '../dto/requests/create-hotel.dto';

export async function mapRecordToCreateHotelDto(
  record: Record<string, string>,
): Promise<CreateHotelDto> {
  try {
    const createDto = plainToInstance(CreateHotelDto, record, {
      enableImplicitConversion: true,
    });

    await validateOrReject(createDto, {
      whitelist: true,
      stopAtFirstError: true,
    });

    return createDto;
  } catch (error) {
    throw error;
  }
}
