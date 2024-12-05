import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStringNumberInRange } from '../../decorators/validations/isInRange.decorators';
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
  @IsOptional()
  @IsString()
  @Matches(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
    {
      message: 'webLink must be a valid URL',
    },
  )
  @Transform(({ value }) => (value === '' ? null : value))
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
  @IsBoolean()
  @Transform(({ value }) => (value === '1' || value === true ? true : false))
  isOpen: boolean;

  @ApiProperty({
    description: 'Hotel longitude as a string within -180 to 180 range',
    example: '121.776',
  })
  @IsStringNumberInRange(-180, 180)
  longitude: string;

  @ApiProperty({
    description: 'Hotel latitude as a string within -90 to 90 range',
    example: '21.671',
  })
  @IsStringNumberInRange(-90, 90)
  latitude: string;
}
