import { HttpStatus } from '@nestjs/common';
import { IResponse } from '../interfaces/response.interface';

export const successResponse = <T>(data?: T): IResponse<T> => {
  return {
    statusCode: HttpStatus.OK,
    message: 'sussess',
    data,
  };
};

export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  total: number;
  page: number;
  size: number;
}
