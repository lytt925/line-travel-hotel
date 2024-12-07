import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true and attach user to request for a valid token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      const mockUser = { id: 1, email: 'test@gmail.com' };

      mockConfigService.get.mockReturnValue('testSecret');
      mockJwtService.verifyAsync.mockResolvedValue(mockUser);
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockRequest);

      const result = await guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
        secret: 'testSecret',
      });
      expect(mockRequest['user']).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = {
        headers: {},
      };

      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockRequest);

      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer expiredToken',
        },
      };

      mockConfigService.get.mockReturnValue('testSecret');
      mockJwtService.verifyAsync.mockRejectedValue(
        new TokenExpiredError('Token expired', new Date()),
      );
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockRequest);

      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      };

      mockConfigService.get.mockReturnValue('testSecret');
      mockJwtService.verifyAsync.mockRejectedValue(
        new JsonWebTokenError('Invalid token'),
      );
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockRequest);

      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(new UnauthorizedException('Invalid token'));
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token if authorization header is valid', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      const token = guard.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBe('validToken');
    });

    it('should return undefined if authorization header is invalid', () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidHeader',
        },
      };
      const token = guard.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });

    it('should return undefined if authorization header is missing', () => {
      const mockRequest = {
        headers: {},
      };
      const token = guard.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });
  });
});
