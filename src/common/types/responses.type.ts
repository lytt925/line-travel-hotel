export interface ControllerResponse<T> {
  message: string;
  data?: T;
}

export interface ApiResponse<T> extends ControllerResponse<T> {
  statusCode: number;
}
