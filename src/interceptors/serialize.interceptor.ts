import * as _ from 'lodash';

import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ERROR_MESSAGES } from 'src/common/messages';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor() {}

  getStatus(err) {
    return _.get(err, 'status') || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  getErrorMessage(err) {
    return _.get(err, 'response.message') || ERROR_MESSAGES.SERVER_ERROR;
  }

  getDetails(err) {
    return _.get(err, 'response.details') || {};
  }

  errorResponse(err) {
    const statusCode = this.getStatus(err);
    const message = this.getErrorMessage(err);
    const details = this.getDetails(err);
    const data = _.get(err, 'response.data');

    return {
      error: {
        statusCode,
        message,
        details,
        data,
        time: new Date(),
      },
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        // Định dạng lại nếu response có dữ liệu phân trang
        const isPaginated = response && typeof response === 'object' && 'data' in response && 'meta' in response;

        if (isPaginated) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            data: response.data,
            meta: {
              ...response.meta,
            },
            message: 'Request successful',
          };
        }

        // Định dạng lại response bình thường
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data: response,
          message: 'Request successful',
        };
      }),
      catchError((err) => {
        console.log('🚀 ~ err:', err);
        // Xử lý lỗi và định dạng lại lỗi
        return throwError(() => {
          const errorResponse = this.errorResponse(err);

          return new HttpException(errorResponse, errorResponse.error.statusCode);
        });
      }),
    );
  }
}
