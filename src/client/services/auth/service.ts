import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AuthService {

    constructor(
        private _http: HttpClient
    ) {}

    login(email: string, password: string): Observable<any> {
        return this._http.post<void>('/api/auth/login', {Email: email, Password: password});
    }

    signup(email: string, password: string): Observable<any> {
        return this._http.post<void>('/api/auth/signup', {Email: email, Password: password});
    }

    logOut(): Observable<any> {
        return this._http.post<void>('/api/auth/logout', {});
    }

    isLoggedIn(): Observable<boolean> {
        return this._http.get<boolean>('/api/auth/valid');
    }

}
