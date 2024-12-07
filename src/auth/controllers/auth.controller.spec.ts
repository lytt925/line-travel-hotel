import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, TokenExpiredError } from '@nestjs/jwt';
import { AuthService } from '../services';
import { ResponsePresenter } from '../../common/presenters/response.presenter';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    signIn: jest.fn(),
    issueTokenByRefreshToken: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  const mockResponsePresenter = {
    formatSuccessResponse: jest.fn((message, data) => ({
      message,
      data,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, JwtModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ResponsePresenter, useValue: mockResponsePresenter },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should set a refresh token as a cookie and return access token', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const mockSignInDto = {
        email: 'test@gmail.com',
        password: 'Password123',
      };
      const mockTokens = {
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
      };

      mockAuthService.signIn.mockResolvedValue(mockTokens);
      mockConfigService.get.mockReturnValue('development');

      const result = await controller.signIn(mockResponse, mockSignInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        mockSignInDto.email,
        mockSignInDto.password,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mockRefreshToken',
        {
          httpOnly: true,
          sameSite: 'strict',
          secure: false,
        },
      );
      expect(result).toEqual({
        message: 'Logged in successfully',
        data: { access_token: 'mockAccessToken' },
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should return a new access token if refresh token is valid', async () => {
      const mockRequest = {
        cookies: { refresh_token: 'validRefreshToken' },
      } as unknown as Request;

      const mockNewAccessToken = 'newAccessToken';
      mockAuthService.issueTokenByRefreshToken.mockResolvedValue(
        mockNewAccessToken,
      );

      const result = await controller.refreshAccessToken(mockRequest);

      expect(mockAuthService.issueTokenByRefreshToken).toHaveBeenCalledWith(
        'validRefreshToken',
      );
      expect(result).toEqual({
        message: 'Access token refreshed successfully',
        data: { access_token: mockNewAccessToken },
      });
    });

    it('should throw UnauthorizedException if no refresh token is provided', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      await expect(controller.refreshAccessToken(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle expired refresh tokens', async () => {
      const mockRequest = {
        cookies: { refresh_token: 'expiredRefreshToken' },
      } as unknown as Request;

      mockAuthService.issueTokenByRefreshToken.mockRejectedValue(
        new TokenExpiredError('Refresh token expired', new Date()),
      );

      await expect(controller.refreshAccessToken(mockRequest)).rejects.toThrow(
        new UnauthorizedException('Refresh token expired'),
      );
    });

    it('should handle invalid refresh tokens', async () => {
      const mockRequest = {
        cookies: { refresh_token: 'invalidRefreshToken' },
      } as unknown as Request;

      mockAuthService.issueTokenByRefreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refreshAccessToken(mockRequest)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });
  });
});
