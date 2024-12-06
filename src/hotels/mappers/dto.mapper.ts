import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateHotelDto } from '../dtos';

export async function mapRecordToCreateHotelDto(
  record: Record<string, any>,
): Promise<CreateHotelDto> {
  if (record.isOpen === '1' || record.isOpen === '0')
    record.isOpen = record.isOpen === '1';
  const createDto = plainToInstance(CreateHotelDto, record);
  await validateOrReject(createDto, {
    whitelist: true,
  });

  return createDto;
}
