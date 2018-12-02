import {OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

export class SubscriberComponent implements OnDestroy {

    private _subscriptions: Subscription[] = [];

    constructor() {}

    ngOnDestroy() {
        this.clearSubscriptions();
    }

    addSubscription(subscription: Subscription): void {
        this._subscriptions.push(subscription);
    }

    clearSubscriptions() {
        this._subscriptions.forEach(s => {
            if (s.unsubscribe) {
                s.unsubscribe();
            }
        });
        this._subscriptions = [];
    }
}
