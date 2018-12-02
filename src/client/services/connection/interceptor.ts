import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectionService } from '@services/connection/service';
import { ToastService } from '@services/toasts/service';

@Injectable()
export class HttpConnectionInterceptor implements HttpInterceptor {

    constructor(
        private _connection: ConnectionService,
        private _toast: ToastService
    ){}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isOnline = this._connection.isOnline();
        if (!isOnline && !/\/api\/((data)|(errors)|(sms))/i.test(request.url)) {
            this._toast.warning('We couldn\'t reach our servers. Please check your internet connection and try again', 'Are you offline?');
        }
        return next.handle(request);
    }
}
