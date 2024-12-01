import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, httpVersion } = req;
    const clientIp = req.ip;
    const clientPort = req.socket.remotePort;

    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${clientIp}:${clientPort} - "${method} ${originalUrl} HTTP/${httpVersion}" ${statusCode} ${statusMessage} - ${responseTime}ms`,
      );
    });

    next();
  }
}
