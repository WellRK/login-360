import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResponseDto } from '../dto/response.dto.js';

/** Embrulha todo retorno de controller em ResponseDto(true, data, null). */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T>> {
    return next.handle().pipe(map((data) => (data instanceof ResponseDto ? data : new ResponseDto(true, data ?? null, null))));
  }
}
