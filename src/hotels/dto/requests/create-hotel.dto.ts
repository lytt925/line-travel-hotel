import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsBoolean,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true') return true;
      if (lower === 'false') return false;
    }
    return value;
  })
  is_open: boolean;

  @ApiProperty({
    description: 'Hotel longitude',
    example: 121.776,
  })
  @Min(-180)
  @Max(180)
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @ApiProperty({
    description: 'Hotel latitude',
    example: 24.671,
  })
  @Min(-90)
  @Max(90)
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude: number;
}
