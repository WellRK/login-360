import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator.js';
import { ResponseDto } from '../dtos/response.dto.js';

/**
 * Embrulha todo retorno de controller em ResponseDto(true, data, null).
 * Não embrulha: rotas com @RawResponse(), StreamableFile (downloads) e o que já é ResponseDto.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T> | T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T> | T> {
    const raw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (raw) return next.handle();
    return next
      .handle()
      .pipe(
        map((data) =>
          data instanceof ResponseDto || data instanceof StreamableFile ? data : new ResponseDto(true, data ?? null, null),
        ),
      );
  }
}
