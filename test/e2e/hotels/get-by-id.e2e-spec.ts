import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './setup';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

describe('GET /api/v1/hotels/:id', () => {
  beforeAll(async () => {
    ({ app } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  const hotelSeedData = [
    {
      name: 'Test Hotel 1',
      webLink: 'https://testhotel1.com',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Test Country',
      email: 'contact@testhotel1.com',
      isOpen: true,
      latitude: '40.712776',
      longitude: '-74.005974',
    },
    {
      name: 'Test Hotel 2',
      webLink: 'https://testhotel2.com',
      address: '456 Example Ave',
      city: 'Example City',
      country: 'Example Country',
      email: 'contact@testhotel2.com',
      isOpen: false,
      latitude: '34.052235',
      longitude: '-118.243683',
    },
  ];

  it('should return hotel details for a valid ID', async () => {
    const validHotelId = 1;
    const response = await request(app.getHttpServer())
      .get(`/api/v1/hotels/${validHotelId}`)
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Hotel found successfully',
      data: {
        id: validHotelId,
        ...hotelSeedData[validHotelId - 1],
      },
    });
  });

  it('should return 404 for invalid ID', async () => {
    const invalidHotelId = 999;
    const response = await request(app.getHttpServer())
      .get(`/api/v1/hotels/${invalidHotelId}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: `Hotel with ID ${invalidHotelId} not found`,
    });
  });
});
