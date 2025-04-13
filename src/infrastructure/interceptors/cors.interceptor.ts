import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
      'Access-Control-Allow-Methods',
      'POST, GET, OPTIONS, PUT, DELETE',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    response.header('Access-Control-Allow-Credentials', true);

    return next.handle();
  }
}
