import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './setup';
import { Repository } from 'typeorm';
import { HotelEntity } from 'src/hotels/entities/hotel.orm-entity';

let app: INestApplication;
let hotelRepository: Repository<HotelEntity>;

describe('POST /api/v1/hotels/import/csv', () => {
  beforeAll(async () => {
    ({ app, hotelRepository } = await setupTestApp());
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('should import hotels successfully from a valid CSV file', async () => {
    const mockCsv = `name,address,email,country,city,longitude,latitude,isOpen,webLink
        礁溪老爺酒店1,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,https://fake-hotels.com
        礁溪老爺酒店2,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(mockCsv), 'test.csv')
      .expect(201);

    expect(response.body).toEqual({
      statusCode: 201,
      message: 'Hotels imported successfully',
      data: {
        successRecords: expect.arrayContaining([{ row: expect.any(Number) }]),
        errorRecords: [],
      },
    });
  });

  it('should handle missing required field', async () => {
    const missingRequiredCsv = `name,address,email,country,city,longitude,latitude,is_open
        礁溪老爺酒店,五峰路69號,emial@mail.com,台灣,宜蘭,121.776,24.671,true`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(missingRequiredCsv), 'test_with_errors.csv')
      .expect(400);

    expect(response.body).toEqual({
      message: 'No records successfully imported',
      data: {
        successRecords: [],
        errorRecords: [
          {
            row: 1,
            errors: [
              'isOpen must be a boolean value; For csv import should be 0 or 1',
            ],
          },
        ],
      },
    });
  });

  it('should handle invalid field format', async () => {
    const invalidFieldCsv = `name,address,email,country,city,longitude,latitude,isOpen
        礁溪老爺酒店1,五峰路69號,hello@email.com,台灣,宜蘭,121.776,24.671,true
        礁溪老爺酒店2,五峰路69號,hello@email.com,台灣,宜蘭,121.776,24.671,false
        礁溪老爺酒店3,五峰路69號,hello@email.com,台灣,宜蘭,121.776,24.671,0
        礁溪老爺酒店4,五峰路69號,hello@email.com,台灣,宜蘭,121.776,24.671,1`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(invalidFieldCsv), 'test_with_errors.csv')
      .expect(201);

    expect(response.body).toEqual({
      statusCode: 201,
      message: 'Some records failed to import',
      data: {
        successRecords: expect.arrayContaining([{ row: 3 }, { row: 4 }]),
        errorRecords: expect.arrayContaining([
          {
            row: expect.any(Number),
            errors: expect.any(Array<string>),
          },
        ]),
      },
    });
  });

  it('should handle webLink correctly', async () => {
    const checkWebLinkCsv = `name,address,email,country,city,longitude,latitude,isOpen,webLink
礁溪老爺酒店1,五峰路69號,hello@email.com,台灣,宜蘭,121.776,24.671,0,
礁溪老爺酒店2,五峰路69號,hello@email.com,台灣,宜蘭,121.776,24.671,1,https://www.hotelroyal.com.tw`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(checkWebLinkCsv), 'checkWebLink.csv')
      .expect(201);

    expect(response.body).toEqual({
      statusCode: 201,
      message: 'Hotels imported successfully',
      data: {
        successRecords: expect.arrayContaining([{ row: 1 }, { row: 2 }]),
        errorRecords: [],
      },
    });
  });

  it('should handle empty file', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(''), 'empty.csv')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'No records found in the file',
      error: 'Bad Request',
    });
  });

  it('should return 400 for invalid CSV format', async () => {
    const invalidCsv = `
        name,address,email,country,city,longitude,latitude,isOpen
        礁溪老爺酒店4,五峰路69號
      `;

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(invalidCsv), 'invalid.csv')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(String),
      error: 'Bad Request',
    });
  });

  it('should return 409 conflict error', async () => {
    const mockCsv = `name,address,email,country,city,longitude,latitude,isOpen,webLink
        礁溪老爺酒店1,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,https://fake-hotels.com
        礁溪老爺酒店1,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(mockCsv), 'test.csv')
      .expect(409);

    expect(response.body).toEqual({
      message: 'Duplicate hotel name',
      error: 'Conflict',
      statusCode: 409,
    });
  });

  it('should return 501 not implemented error', async () => {
    const mockCsv = `name,address,email,country,city,longitude,latitude,isOpen,webLink
        礁溪老爺酒店1,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,https://fake-hotels.com`;

    jest.spyOn(hotelRepository, 'insert').mockImplementation(() => {
      throw new Error('Some error');
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/hotels/import/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', Buffer.from(mockCsv), 'test.csv')
      .expect(500);

    expect(response.body).toEqual({
      error: 'Internal Server Error',
      message: 'Failed to import hotels',
      statusCode: 500,
    });
  });
});
