import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';
import * as request from 'supertest';

let app: INestApplication;
let hotelRepository: any;
describe('POST /api/v1/hotels', () => {
  beforeAll(async () => {
    ({ app, hotelRepository } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  const newHotel = {
    name: '礁溪老爺酒店',
    webLink: 'https://hotel.com',
    country: '台灣',
    city: '宜蘭',
    address: '五峰路69號',
    email: 'hotel@hotel.com',
    isOpen: true,
    longitude: '121.776',
    latitude: '24.671',
  };
  it('should create a hotel successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels')
      .send(newHotel)
      .expect(201);

    expect(response.body).toEqual({
      statusCode: 201,
      message: 'Hotel created successfully',
      data: expect.objectContaining({
        id: expect.any(Number),
        ...newHotel,
      }),
    });
  });

  it('should return 400 for invalid input', async () => {
    const invalidHotel = {
      webLink: 'https://hotel.com',
      email: 'invalid-email-format',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels')
      .send(invalidHotel)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(Array<string>),
      error: 'Bad Request',
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const missingFieldsHotel = {};
    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels')
      .send(missingFieldsHotel)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(Array),
      error: 'Bad Request',
    });
  });

  it('should throw error if hotel already exists', async () => {
    jest.spyOn(hotelRepository, 'findOne').mockResolvedValueOnce({ id: 1 });
    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels')
      .send(newHotel);
    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      statusCode: 409,
      message: 'Hotel name already exists',
      error: 'Conflict',
    });
  });
});
