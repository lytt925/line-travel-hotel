import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse } from '../types/responses.type';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // add status code to response
      map((data): ApiResponse<any> => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          ...data,
        };
      }),
    );
  }
}
