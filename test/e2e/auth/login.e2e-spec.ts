import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './setup';

let app: INestApplication;

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    ({ app } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  const loginUser = {
    email: 'login@gmail.com',
    password: 'Password1234',
    firstName: 'login',
    lastName: 'test',
  };

  it('should return 200 and new access token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(loginUser)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: loginUser.email, password: loginUser.password })
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        access_token: expect.any(String),
        user: {
          id: expect.any(Number),
          email: loginUser.email,
          lastName: loginUser.lastName,
          firstName: loginUser.firstName,
        },
      },
    });
  });

  // user not found
  it('should return 401 for invalid user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'not-exist@gmail.com', password: 'password' })
      .expect(404);
    expect(response.body).toEqual({
      message: 'User not found',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  // wrong password
  it('should return 401 for wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: loginUser.email, password: 'wrong-password' })
      .expect(401);
    expect(response.body).toEqual({
      message: 'Wrong password',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
});
