import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

/**
 * ABSTRACT COMPONENT
 */
@Component({
    selector: 'subscriber-component',
    template: ''
})
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
