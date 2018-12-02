import {Component, OnInit} from '@angular/core';
import {distinctUntilChanged} from 'rxjs/operators';
import {Animations} from '@core/animations/index';
import {SubscriberComponent} from '@core/component/subscriber';
import {Toast} from '@models/shared/toast';
import {ConnectionService, ToastService, WebviewService} from '@services/index';

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    animations: [
        Animations.slideInTop,
        Animations.toast
    ]
})
export class AppComponent extends SubscriberComponent implements OnInit {

    online: boolean = true; // default to true to avoid banner-flicker
    inWebView: boolean = false;
    toasts: Toast[] = [];

    constructor(
        private _connection: ConnectionService,
        private _toast: ToastService,
        private _webviewSerice: WebviewService
    ) {
        super();
    }

    ngOnInit() {
        this.inWebView = this._webviewSerice.isWebview();

        this.addSubscription(
            this._connection.observeOnline()
            .pipe(
                distinctUntilChanged()
            )
            .subscribe(
                isOnline => this.online = isOnline
            )
        );

        this.addSubscription(
            this._toast.observeToasts()
            .subscribe(
                t => {
                    const existing = this.toasts.findIndex(et => et.id === t.id);
                    if (existing < 0) {
                        if (this.toasts && this.toasts.length >= 3) {
                            this.toasts.shift();
                        }
                        this.toasts.push(t);
                    }
                }
            )
        );
    }

    reapToast(toastId: string, dismissed: boolean) {
        const burnt = this.toasts.findIndex(t => t.id === toastId);
        if (burnt >= 0){
            this.toasts.splice(burnt, 1);
        }
    }
}
