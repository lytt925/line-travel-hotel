import { CreateHotelDto } from '../dto/create-hotel.dto';
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
