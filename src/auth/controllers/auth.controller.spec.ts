import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services';
import { ResponsePresenter } from '../../common/presenters/response.presenter';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, JwtModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        ResponsePresenter,
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
