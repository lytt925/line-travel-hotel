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

export class CreateHotelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Matches(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
    {
      message: 'webLink must be a valid URL',
    },
  )
  webLink?: string; // Optional

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsEmail()
  email: string;

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

  @Min(-180)
  @Max(180)
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @Min(-90)
  @Max(90)
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude: number;
}
