import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './setup';

let app: INestApplication;
let jwtService: any;

const getJwtRefreshToken = async (userId: number, expiresIn: string = '1m') => {
  const testUserPayload = { id: userId };
  return jwtService.signAsync(testUserPayload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn,
  });
};

describe('POST /api/v1/auth/refresh', () => {
  beforeAll(async () => {
    ({ app, jwtService } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('should return 200 and new access token', async () => {
    const userId = 1;
    const validRefreshToken = await getJwtRefreshToken(userId);
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${validRefreshToken}`])
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Access token refreshed successfully',
      data: {
        access_token: expect.any(String),
      },
    });
  });

  it('should return 401 for invalid refresh token', async () => {
    const invalidRefreshToken = 'invalid_refresh_token';
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${invalidRefreshToken}`])
      .expect(401);

    expect(response.body).toEqual({
      message: 'Invalid refresh token',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  // no token
  it('should return 401 for no refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .expect(401);

    expect(response.body).toEqual({
      message: 'No refresh token provided',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  // expired token
  it('should return 401 for expired refresh token', async () => {
    const expiredRefreshToken = await getJwtRefreshToken(1, '0ms');
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${expiredRefreshToken}`])
      .expect(401);

    expect(response.body).toEqual({
      message: 'Refresh token expired',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
});
