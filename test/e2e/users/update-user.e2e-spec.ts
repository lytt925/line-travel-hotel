import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';
import * as request from 'supertest';

let app: INestApplication;
let jwtService: any;

const getJwtToken = async (userId: number, expiresIn: string = '1m') => {
  const testUserPayload = { userId };
  return jwtService.signAsync(testUserPayload, {
    secret: process.env.JWT_SECRET,
    expiresIn,
  });
};

describe('PATCH /api/v1/users/:id', () => {
  beforeAll(async () => {
    ({ app, jwtService } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  const updatedUser = {
    email: 'user1@gmail.com',
    password: 'Password1234',
    firstName: 'User1',
    lastName: 'Test',
  };

  it('should update a user successfully', async () => {
    const userIdToUpdate = 1;
    const validToken = await getJwtToken(userIdToUpdate);
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(updatedUser)
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'User updated successfully',
      data: {
        id: userIdToUpdate,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  });

  it('should return 401 for unauthorized user', async () => {
    const userIdToUpdate = 1;
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .send(updatedUser)
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'No token provided',
    });
  });

  it('should return 401 for expired token', async () => {
    const userIdToUpdate = 1;
    const expiredToken = await getJwtToken(userIdToUpdate, '0ms');

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send(updatedUser)
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token expired',
    });
  });

  it('should return 401 for invalid token', async () => {
    const userIdToUpdate = 1;
    const invalidToken = 'invalid-token';
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(updatedUser)
      .expect(401);
    expect(response.body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  });

  it('should return 403 for no permission token', async () => {
    const userIdToUpdate = 1;
    const invalidToken = await getJwtToken(userIdToUpdate + 1, '1m');
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(updatedUser)
      .expect(403);

    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'You are not allowed to update this user',
    });
  });

  it('should return 404 for invalid input', async () => {
    const userIdToUpdate = 999;
    const validToken = await getJwtToken(999);
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(updatedUser)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: `User not found`,
    });
  });

  it('should return 400 for invalid path', async () => {
    const userIdToUpdate = 'invalid';
    const validToken = await getJwtToken(1);
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(updatedUser)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
    });
  });

  it('should return 400 for invalid body', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'short',
    };
    const validToken = await getJwtToken(1);
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/1`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(invalidUser)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(Array),
      error: 'Bad Request',
    });
  });

  it('should return 409 if email already exists', async () => {
    const prevUserResponse = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ ...updatedUser, email: 'user2@gmail.com' })
      .expect(201);

    const { id } = prevUserResponse.body.data;
    const validToken = await getJwtToken(id);
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${id}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(updatedUser)
      .expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      error: 'Conflict',
      message: 'Email already exists',
    });
  });
});
