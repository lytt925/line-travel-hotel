import { ApiProperty } from '@nestjs/swagger';

export class Hotel {
  @ApiProperty({
    description: 'Hotel ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Hotel name',
    example: '礁溪老爺酒店',
  })
  name: string;

  @ApiProperty({
    description: 'Hotel website link',
    required: false,
    example: 'https://hotel.com',
  })
  webLink?: string;

  @ApiProperty({
    description: 'Hotel address',
    example: '五峰路693號',
  })
  address: string;

  @ApiProperty({
    description: 'Hotel city',
    example: '宜蘭',
  })
  city: string;

  @ApiProperty({
    description: 'Hotel country',
    example: '台灣',
  })
  country: string;

  @ApiProperty({
    description: 'Hotel email',
    example: 'hotel@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Hotel open status',
    example: true,
  })
  isOpen: boolean;

  @ApiProperty({
    description: 'Hotel latitude',
    example: '24.671',
  })
  latitude: string;

  @ApiProperty({
    description: 'Hotel longitude',
    example: '121.776',
  })
  longitude: string;
}
