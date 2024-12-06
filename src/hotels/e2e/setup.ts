import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HotelEntity } from '../entities/hotel.orm-entity';

let app: INestApplication;
let hotelRepository: any;

export const setupTestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.init();

  hotelRepository = moduleFixture.get(getRepositoryToken(HotelEntity));
  return { app, hotelRepository };
};

export const teardownTestApp = async () => {
  if (app) await app.close();
};
