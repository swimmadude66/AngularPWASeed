import { Injectable, Inject, Optional } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ServerSideRequestInterceptor implements HttpInterceptor {

    constructor(
        @Optional() @Inject('serverURL') private _serverUrl: string,
        @Optional() @Inject('serverAuth') private _serverAuth: string
    ){}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let url = request.urlWithParams;
        let headers = request.headers;
        if (this._serverAuth && this._serverAuth.length) {
            headers = headers.append('authorization', `BEARER ${this._serverAuth}`);
        }
        if (this._serverUrl && request.url[0] === '/') {
            url = `${this._serverUrl}${request.urlWithParams}`;
        }
        request = request.clone({url: url, headers});
        return next.handle(request);
    }
}
