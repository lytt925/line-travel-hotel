import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';

let app: INestApplication;
let jwtService: JwtService;

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

export const setupTestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.init();

  jwtService = moduleFixture.get(JwtService);

  return { app, jwtService };
};

export const teardownTestApp = async () => {
  if (app) await app.close();
};
