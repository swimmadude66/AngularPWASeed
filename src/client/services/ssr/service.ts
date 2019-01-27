import {Injectable, PLATFORM_ID, Inject} from '@angular/core';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';


@Injectable({
    providedIn: 'root'
})
export class ServerSideService {

    constructor(
        @Inject(PLATFORM_ID) private _platformId
    ) {
    }

    isBrowser(): boolean {
        return isPlatformBrowser(this._platformId);
    }

    isServer(): boolean {
        return isPlatformServer(this._platformId);
    }
}
