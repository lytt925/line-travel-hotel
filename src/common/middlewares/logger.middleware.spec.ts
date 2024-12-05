import { HttpLoggerMiddleware } from './logger.middleware';
import { Logger } from '@nestjs/common';

describe('HttpLoggerMiddleware', () => {
  let middleware: HttpLoggerMiddleware;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = new Logger();
    jest.spyOn(mockLogger, 'log');
    middleware = new HttpLoggerMiddleware();
    (middleware as any).logger = mockLogger;
  });

  it('should log correct information on response finish', () => {
    const mockRequest: any = {
      method: 'GET',
      originalUrl: '/test',
      httpVersion: '1.1',
      ip: '127.0.0.1',
      socket: { remotePort: 12345 },
    };

    const mockResponse: any = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
      statusCode: 200,
      statusMessage: 'OK',
    };

    const mockNext = jest.fn();

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();

    expect(mockResponse.on).toHaveBeenCalledWith(
      'finish',
      expect.any(Function),
    );

    const logMessage = `${mockRequest.ip}:${mockRequest.socket.remotePort} - "GET /test HTTP/1.1" 200 OK - `;
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining(logMessage),
    );
  });
});
