import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DemoResolver implements Resolve<string> {

    constructor(
        private _router: Router,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<string> {
        return of('This is a demo!');
    }
}
