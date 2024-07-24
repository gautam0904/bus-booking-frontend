import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accesstoken = localStorage.getItem('token');

    const modifiedRequest = request.clone({
      setHeaders: {
        authorization : `Bearer ${accesstoken}`
      }
    });
    
    return next.handle(modifiedRequest)
  }
}
