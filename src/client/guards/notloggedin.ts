import {Injectable} from '@angular/core';
import {
    CanLoad, 
    CanActivate, 
    CanActivateChild, 
    Router, 
    Route, 
    ActivatedRouteSnapshot, 
    RouterStateSnapshot
} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {tap, map} from 'rxjs/operators';
import {AuthService} from '@services/*';

@Injectable()
export class NotLoggedInGuard implements CanLoad, CanActivate, CanActivateChild {
    loggedIn: boolean;

    constructor(
        private _router: Router,
        private _auth: AuthService
    ) {}

    canLoad(route: Route): Observable<boolean> {
        return this._isLoggedIn();
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this._isLoggedIn();
    }
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this._isLoggedIn();
    }

    private _isLoggedIn(): Observable<boolean> {
        return this._auth.isLoggedIn()
        .pipe(
            tap(isLoggedIn => {
                this.loggedIn = isLoggedIn;
                if (isLoggedIn) {
                    return this._router.navigate(['/']);
                }
            }),
            map(isLoggedIn => !isLoggedIn)
        );
    }
}
