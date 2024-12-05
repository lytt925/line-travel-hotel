import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateHotelDto {
  @ApiProperty({
    description: 'Hotel name',
    example: '礁溪老爺酒店',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Hotel website link',
    example: 'https://hotel.com',
    required: false,
  })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @ValidateIf((o) => !!o.webLink)
  webLink?: string; // Optional

  @ApiProperty({
    description: 'Hotel country',
    example: '台灣',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Hotel city',
    example: '宜蘭',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Hotel address',
    example: '五峰路69號',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Hotel email',
    example: 'hotel@hotel.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Hotel status',
    example: true,
  })
  @IsBoolean({
    message: 'isOpen must be a boolean value; For csv import should be 0 or 1',
  })
  isOpen: boolean;

  @ApiProperty({
    description: 'Hotel longitude as a string within -180 to 180 range',
    example: '121.776',
  })
  @IsLongitude()
  @Transform(({ value }) => value.toString())
  longitude: string;

  @ApiProperty({
    description: 'Hotel latitude as a string within -90 to 90 range',
    example: '21.671',
  })
  @Transform(({ value }) => value.toString())
  @IsLatitude()
  latitude: string;
}
