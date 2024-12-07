import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './';
import { UsersService } from '../../users/services';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const mockUser = {
      id: 1,
      email: 'test@gmail.com',
      password: 'hashedPassword',
      firstName: 'YT',
      lastName: 'Li',
    };

    it('should return access and refresh tokens on valid credentials', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');
      mockJwtService.signAsync.mockResolvedValueOnce('refreshToken');
      mockConfigService.get.mockReturnValue('mock_refresh_secret');

      const result = await service.signIn('test@example.com', 'password');

      expect(result).toEqual({
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(
        service.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.signIn('nonexistent@example.com', 'password'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('issueTokenByRefreshToken', () => {
    const mockPayload = {
      userId: 1,
      email: 'test@gmail.com',
      firstName: 'YT',
      lastName: 'Li',
    };

    it('should return a new token when refresh token is valid', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockJwtService.signAsync.mockReturnValue('newAccessToken');
      mockConfigService.get.mockReturnValue('mock_refresh_secret');

      const result = await service.issueTokenByRefreshToken('refreshToken');

      expect(result).toBe('newAccessToken');
      expect(mockJwtService.verify).toHaveBeenCalledWith('refreshToken', {
        secret: 'mock_refresh_secret',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        expiresIn: expect.any(String),
        secret: expect.any(String),
      });
    });

    it('should throw an error if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.issueTokenByRefreshToken('invalidRefreshToken'),
      ).rejects.toThrow(Error);
    });
  });
});
