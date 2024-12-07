import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';
import { CreateUserDto } from '../../../src/users/dto';
import * as request from 'supertest';

let app: INestApplication;
describe('POST /api/v1/users', () => {
  beforeAll(async () => {
    ({ app } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  const mockCreateUserDto: CreateUserDto = {
    email: 'ytli.tw2@gmail.com',
    password: 'Password1234',
    firstName: 'YT',
    lastName: 'Li',
  };

  it('should create a user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(mockCreateUserDto)
      .expect(201);

    expect(response.body).toEqual({
      statusCode: 201,
      message: 'User created successfully',
      data: {
        id: expect.any(Number),
        email: mockCreateUserDto.email,
        firstName: mockCreateUserDto.firstName,
        lastName: mockCreateUserDto.lastName,
      },
    });
  });

  const invalidCreateUserDto = {
    ...mockCreateUserDto,
    email: 'invalid-email',
    password: 'short',
  };

  it('should return 400 for invalid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(invalidCreateUserDto)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(Array),
      error: 'Bad Request',
    });
  });

  it('should return 400 for duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ ...mockCreateUserDto, email: 'user@gmail.com' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ ...mockCreateUserDto, email: 'user@gmail.com' })
      .expect(409);

    expect(response.body).toEqual({
      message: 'Email already exists',
      error: 'Conflict',
      statusCode: 409,
    });
  });
});
