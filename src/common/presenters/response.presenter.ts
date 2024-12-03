import { Injectable } from '@nestjs/common';
import { ControllerResponse } from '../types/responses.type';

@Injectable()
export class ResponsePresenter {
  formatSuccessResponse<T>(message: string, data?: T): ControllerResponse<T> {
    return { message, data };
  }
}
