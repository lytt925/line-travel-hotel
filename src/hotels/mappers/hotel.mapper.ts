import { CreateHotelDto } from '../dtos/requests/create-hotel.dto';
import { Hotel } from '../entities/hotel.entity';

export const mapCreateHotelDtoToEntity = (dto: CreateHotelDto): Hotel => {
  const hotel = new Hotel();
  hotel.name = dto.name;
  hotel.webLink = dto.webLink;
  hotel.email = dto.email;
  hotel.address = `${dto.address},${dto.city},${dto.country}`;
  hotel.coordinate = `${dto.latitude},${dto.longitude}`;
  hotel.status = dto.is_open ? 1 : 0;
  return hotel;
};

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
