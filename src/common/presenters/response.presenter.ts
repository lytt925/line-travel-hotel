import { ControllerResponse } from '../types/responses.type';

export function formatSucessResponse<T>(
  message: string,
  data?: T,
): ControllerResponse<T> {
  return { message, data };
}
