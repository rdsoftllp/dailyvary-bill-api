import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  data?: T;
  message: string;
  statusCode: HttpStatus;
  error?: any;
  success: boolean;
}

export const ApiSuccessResponse = <T = any>(
  data: T,
  message: string = 'success',
  statusCode: HttpStatus = HttpStatus.OK,
): ApiResponse => {
  return {
    statusCode,
    message,
    success: true,
    data: data || {},
  };
};

export const ApiErrorResponse = <T = any>(
  error: T,
  message: string = 'error',
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): ApiResponse => {
  return {
    statusCode,
    message,
    success: false,
    data: error || {},
  };
};
