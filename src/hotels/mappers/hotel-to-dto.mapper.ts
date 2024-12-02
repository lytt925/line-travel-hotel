import { CreateHotelDto } from '../dto/create-hotel.dto';
import { Hotel } from '../entities/hotel.entity';

export const mapEntityToCreateHotelDto = (entity: Hotel): CreateHotelDto => {
  const dto = new CreateHotelDto();
  dto.name = entity.name;
  dto.webLink = entity.webLink;
  dto.email = entity.email;
  dto.address = entity.address.split(',')[0];
  dto.city = entity.address.split(',')[1];
  dto.country = entity.address.split(',')[2];
  dto.latitude = Number(entity.coordinate.split(',')[0]);
  dto.longitude = Number(entity.coordinate.split(',')[1]);
  dto.is_open = entity.status === 1 ? true : false;
  return dto;
};
