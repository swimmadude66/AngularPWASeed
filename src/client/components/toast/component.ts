import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { SubscriberComponent } from '@core';
import { Toast, ToastType } from '@models/shared/toast';

@Component({
    selector: 'toast',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class ToastComponent extends SubscriberComponent implements OnInit {

    ToastType: typeof ToastType = ToastType;

    @Input('toast') toast: Toast;
    @Output('dismiss') dismiss: EventEmitter<boolean> = new EventEmitter<boolean>(); // boolean value to represent whether it was killed, or expired

    private _expired: boolean = false;

    ngOnInit() {
        this.addSubscription(
            timer(0, 100)
            .pipe(takeWhile(_ => !this._expired))
            .subscribe(
                _ => {
                    const now = new Date().valueOf();
                    if (now >= this.toast.expires.valueOf()) {
                        this._expired = true;
                        this.dismiss.emit(false);
                    }
                }
            )
        );
    }

    dismissToast() {
        if (!this._expired && this.toast.dismissable) {
            this._expired = true;
            this.dismiss.emit(true);
        }
    }
}
