import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, of as ObservableOf, ReplaySubject, Subscription, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BrowserStorageService } from '@services/caching/browser_storage/service';
import { ServerSideService } from '@services/ssr';

// interface only used locally
interface CacheValue<T> {
  value: T; // Value to be returned
  expiration: number; // expiration in millis since 1970
}

// arg type interface is exported
export interface CacheOpts {
  cacheTime?: number; // millis to keep
  disableCache?: boolean; // DO NOT CACHE
  invalidateKeys?: string[]; // invalidate these other keys
}

const DEFAULT_CACHE_TIME = 30000; // 30 second cache time

@Injectable({
  providedIn: 'root'
})
export class HttpCacheService implements OnDestroy {

    private _cache: {[key: string]: CacheValue<any>} = {};
    private _inFlight: {[key: string]: Subject<any>} = {};

    private _reaper: Subscription;

    constructor(
        private _store: BrowserStorageService,
        private _ssr: ServerSideService
    ) {
        if (this._ssr.isBrowser()) {
            console.log('platform is browser');
            try {
                const shcIndexString = this._store.getSession('shcindex');
                if (shcIndexString && shcIndexString.length) {
                    const shcIndex = JSON.parse(shcIndexString);
                    shcIndex.forEach((cacheKey: string) => {
                        const cv = this._store.getSession(`shc_${cacheKey}`);
                        if (cv && cv.length) {
                            try {
                                const value = JSON.parse(cv);
                                this._cache[cacheKey] = value;
                            } catch (e) {
                                // do nothing
                            }
                        }
                    });
                }
            } catch (e) {
                // do nothing
            }

            this._reaper = timer(0, 60*1000)
            .subscribe(
                _ => {
                    const now = new Date().valueOf();
                    Object.keys(this._cache).forEach(ck => {
                        const val: CacheValue<any> = this._cache[ck];
                        if (val.expiration >=0 && val.expiration <= now) {
                            delete this._cache[ck];
                            try {
                                this._store.removeSession(`shc_${ck}`);
                                this._store.setSession(`shcindex`, JSON.stringify(Object.keys(this._cache)));
                            } catch (e) {
                                // do nothing
                            }
                        }
                    });
                    this._store.setSession(`shcindex`, JSON.stringify(Object.keys(this._cache)));
                }
            );
        }
    }

    ngOnDestroy() {
        if (this._reaper) {
            try {
                this._reaper.unsubscribe();
                this._reaper = undefined;
            } catch (e) {
                // do nothing
            }
        }
    }

    cacheRequest<T>(keyName: string, fallback: Observable<T>, cacheOpts: CacheOpts = {}): Observable<T> {
        const now = new Date().valueOf();
        if (this._cache[keyName] && (this._cache[keyName].expiration >= now || this._cache[keyName].expiration < 0)) {
            return ObservableOf(this._cache[keyName].value as T);
        }
        if (this._inFlight[keyName] && !this._inFlight[keyName].closed && !this._inFlight[keyName].hasError) {
            return this._inFlight[keyName];
        } else {
            this._inFlight[keyName] = new ReplaySubject<T>(1);
            return fallback
            .pipe(
                tap(result => {
                    if (this._inFlight[keyName]) {
                        this._inFlight[keyName].next(result);
                    }
                    this.cacheResult(keyName, result, cacheOpts);
                }, err => { // propagate errors to all listeners
                    if (this._inFlight[keyName]) {
                        try {
                            this._inFlight[keyName].error(err);
                        } catch (e) {
                            // do nothing, its already closed;
                        }
                        delete this._inFlight[keyName];
                    }
                }, () => {
                    if (this._inFlight[keyName]) {
                        try {
                            this._inFlight[keyName].complete();
                        } catch (e) {
                            // do nothing, its already closed;
                        }
                        delete this._inFlight[keyName];
                    }
                })
            );
        }
    }

    cacheResult<T>(keyName: string, result: T, cacheOpts: CacheOpts = {}): void {
        if (!cacheOpts.disableCache && !!result) { // respect DNC request, and don't cache nulls
            const responseTime = new Date().valueOf();
            let expiration = responseTime + DEFAULT_CACHE_TIME;
            if (cacheOpts.cacheTime) {
                if (cacheOpts.cacheTime < 0) {
                    expiration = -1;
                } else {
                    expiration = responseTime + cacheOpts.cacheTime;
                }
            }
            const cacheValue = {
                value: result,
                expiration: expiration
            };
            this._setInCache(keyName, cacheValue);
        }
        if (cacheOpts.invalidateKeys) {
            cacheOpts.invalidateKeys.forEach(ik => {
                this.invalidateCache(ik);
            });
        }
    }

    invalidateCache(keyName: string) {
        delete this._cache[keyName];
        if (this._inFlight[keyName]) {
            this._inFlight[keyName].complete();
            delete this._inFlight[keyName];
        }
        try {
            this._store.removeSession(`shc_${keyName}`);
            this._store.setSession(`shcindex`, JSON.stringify(Object.keys(this._cache)));
        } catch (e) {
            // do nothing
        }
    }

    clearCache() {
        Object.keys(this._cache).forEach(ck => {
            try {
                this._store.removeSession(`shc_${ck}`);
            } catch (e) {
                // do nothing
            }
        });
        this._store.removeSession('shcindex');
        this._cache = {};
        Object.keys(this._inFlight).forEach(inf => {
            this._inFlight[inf].complete();
            delete this._inFlight[inf];
        });
        this._inFlight = {};
    }

    invalidateCachePattern(pattern: RegExp): void {
        const cacheKeys = Object.keys(this._cache).map(k => k.replace(/^shc_/, ''));
        const matches = cacheKeys.filter(k => pattern.test(k));
        matches.forEach(m => {
            this.invalidateCache(m);
        });
    }

    private _setInCache<T>(keyname: string, result: CacheValue<T>) {
        this._cache[keyname] = result;
        try {
            this._store.setSession(`shc_${keyname}`, JSON.stringify(result));
            this._store.setSession(`shcindex`, JSON.stringify(Object.keys(this._cache)));
        } catch (e) {
            // do nothing
        }
    }
}
