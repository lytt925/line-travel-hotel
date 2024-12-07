import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './setup';

let app: INestApplication;

describe('PATCH /api/v1/hotels/:id', () => {
  beforeAll(async () => {
    ({ app } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });
  const updatedHotel = {
    name: 'Updated Hotel Name',
    webLink: 'https://updated-hotel.com',
    country: 'Updated Country',
    city: 'Updated City',
    address: 'Updated Address',
    email: 'ytli.w@gmail.com',
    isOpen: false,
    longitude: '121.776',
    latitude: '24.671',
  };
  it('should update a hotel successfully', async () => {
    const hotelIdToUpdate = 1;
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/hotels/${hotelIdToUpdate}`)
      .send(updatedHotel)
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Hotel updated successfully',
      data: { id: hotelIdToUpdate, ...updatedHotel },
    });
  });

  it('should return 404 for invalid input', async () => {
    const hotelIdToUpdate = 999;
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/hotels/${hotelIdToUpdate}`)
      .send(updatedHotel)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: `Hotel with ID ${hotelIdToUpdate} not found`,
    });
  });
});
