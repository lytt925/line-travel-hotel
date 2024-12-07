import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';
import * as request from 'supertest';

let app: INestApplication;
describe('GET /api/v1/users/:id', () => {
  beforeAll(async () => {
    ({ app } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('should return user details for a valid ID', async () => {
    const validUserId = 1;
    const response = await request(app.getHttpServer())
      .get(`/api/v1/users/${validUserId}`)
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'User found successfully',
      data: {
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
      },
    });
  });

  it('should return 404 for invalid ID', async () => {
    const invalidUserId = 999;
    const response = await request(app.getHttpServer())
      .get(`/api/v1/users/${invalidUserId}`)
      .expect(404);

    expect(response.body).toEqual({
      message: 'User not found',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('should return 400 for invalid ID', async () => {
    const invalidUserId = 'invalid';
    const response = await request(app.getHttpServer())
      .get(`/api/v1/users/${invalidUserId}`)
      .expect(400);
    expect(response.body).toEqual({
      message: 'Validation failed (numeric string is expected)',
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
