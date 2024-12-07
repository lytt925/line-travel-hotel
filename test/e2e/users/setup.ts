import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../../src/users/entities/user.orm-entity';
import { JwtService } from '@nestjs/jwt';

let app: INestApplication;
let userRepository: any;
let jwtService: JwtService;

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

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

  userRepository = moduleFixture.get(getRepositoryToken(UserEntity));
  jwtService = moduleFixture.get(JwtService);

  return { app, userRepository, jwtService };
};

export const teardownTestApp = async () => {
  if (app) await app.close();
};
