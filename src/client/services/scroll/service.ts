import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, Subject, fromEvent, Observable, Subscription } from 'rxjs';
import { map, tap, throttleTime, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ScrollService implements OnDestroy {

    private _scrollSubject: Subject<number> = new ReplaySubject<number>(2);

    private _scrollSub: Subscription;

    private _prevScrollTop: number = 0;
    private _scrollLock: boolean = false;

    constructor() {
        this._prevScrollTop = window.scrollY || window.pageYOffset;
        this._scrollSub = fromEvent(window, 'scroll', {passive: true})
        .pipe(
            filter(_ => !this._scrollLock),
            throttleTime(50),
            map(event => window.scrollY || window.pageYOffset),
            tap(scrollPos => this._scrollSubject.next(scrollPos))
        )
        .subscribe(_ => _);

        window.addEventListener('scroll', this._scrollListener, {passive: true});
    }

    ngOnDestroy() {
        if (this._scrollSub && this._scrollSub.unsubscribe) {
            this._scrollSub.unsubscribe();
        }
        this._scrollSub = undefined;
        window.removeEventListener('scroll', this._scrollListener);
    }

    observeScrollEvents(): Observable<number> {
        return this._scrollSubject;
    }

    lockScroll(): void {
        this._scrollLock = true;
    }

    unlockScroll(): void {
        this._scrollLock = false;
    }

    scrollToTop(): void {
        window.scroll(0,0);
    }

    private _scrollListener(event) {
        if (this._scrollLock) {
            window.scrollTo(0, this._prevScrollTop || 0);
        }
        this._prevScrollTop = window.scrollY || window.pageYOffset;
    }
}
