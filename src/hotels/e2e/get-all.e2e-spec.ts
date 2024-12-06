import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';

let app: INestApplication;

describe('GET /api/v1/hotels', () => {
  beforeAll(async () => {
    ({ app } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('should return a list of hotels', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/hotels?page=1')
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Hotels found successfully',
      data: {
        hotels: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            webLink: expect.any(String),
            country: expect.any(String),
            city: expect.any(String),
            address: expect.any(String),
            email: expect.any(String),
            isOpen: expect.any(Boolean),
            latitude: expect.any(String),
            longitude: expect.any(String),
          }),
        ]),
        page: 1,
      },
    });

    expect(response.body.data.hotels.length).toBeGreaterThan(0);
  });

  it('should return page 1 if page is not provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/hotels')
      .expect(200);
    expect(response.body.data.page).toBe(1);
    expect(response.body.data.hotels.length).toBeGreaterThan(0);
  });

  it('should return 400 for invalid page number', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/hotels?page=0')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Page must be an integer greater than or equal to 1',
    });
  });
});
