import { Injectable } from '@nestjs/common';
@Injectable()
export class ResponsePresenter {
  formatSuccessResponse(message: string, data?: unknown) {
    return { message, data };
  }
}
