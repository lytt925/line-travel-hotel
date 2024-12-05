import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { VersioningType } from '@nestjs/common';
import { hotelSeedData } from './seeds/data/hotels';

describe('End to end testing for hotel routes', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/hotels/:id', () => {
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

  describe('GET /api/v1/hotels', () => {
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

  describe('POST /api/v1/hotels', () => {
    it('should create a hotel successfully', async () => {
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
  });

  describe('POST /api/v1/hotels/import/csv', () => {
    it('should import hotels successfully from a valid CSV file', async () => {
      const mockCsv = `name,address,email,country,city,longitude,latitude,isOpen,webLink
        礁溪老爺酒店1,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,https://fake-hotels.com`;

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

    it('should handle partial errors in the CSV file', async () => {
      const mockCsvWithErrors = `name,address,email,country,city,longitude,latitude,isOpen,webLink
        礁溪老爺酒店2,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,1,
        礁溪老爺酒店3,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,24.671,wrong,
        礁溪老爺酒店3,,ytlit.wt@gami.com,台灣,宜蘭,12.776,94.671,1,
        礁溪老爺酒店4,五峰路69號,ytlit.wt@gami.com,台灣,,12.776,24.671,0,
        礁溪老爺酒店4,五峰路69號,ytlit.wt@gami.com,,宜蘭,12.776,24.671,0,
        礁溪老爺酒店4,五峰路69號,https://error.com,台灣,宜蘭,12.776,24.671,1,
        礁溪老爺酒店5,五峰路69號,ytlit.wt@gami.com,台灣,宜蘭,12.776,94.671,1,https://fake-hotels.com`;

      const response = await request(app.getHttpServer())
        .post('/api/v1/hotels/import/csv')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', Buffer.from(mockCsvWithErrors), 'test_with_errors.csv')
        .expect(201);

      expect(response.body).toEqual({
        statusCode: 201,
        message: 'Hotels imported with errors',
        data: {
          successRecords: expect.arrayContaining([{ row: expect.any(Number) }]),
          errorRecords: expect.arrayContaining([
            {
              row: expect.any(Number),
              errors: expect.any(Array<string>),
            },
          ]),
        },
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
  });

  describe('PATCH /api/v1/hotels/:id', () => {
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
});
