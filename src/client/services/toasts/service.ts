import { Injectable } from '@angular/core';
import { Toast, ToastType, ToastOptions } from '@models/shared/toast';
import { Subject, Observable } from 'rxjs';

const defaultOpts: ToastOptions = {
    expireMillis: 5000,
    dismissable: true
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private _toastSubject: Subject<Toast> = new Subject<Toast>();

    constructor(){}

    toast(type: ToastType, message: string, title?: string, options: ToastOptions = defaultOpts): Toast {
        const id = new Buffer(type + title + (message || ''), 'utf8').toString('base64');
        const now = new Date();
        const expires = options.expireTime || new Date(now.valueOf() + (options.expireMillis || defaultOpts.expireMillis));
        const t: Toast = {
            id,
            expires,
            type,
            title,
            message,
            dismissable: options.dismissable
        };
        this._toastSubject.next(t);
        return t;
    }

    error(message: string, title?: string, options: ToastOptions = defaultOpts): Toast {
        return this.toast(ToastType.Error, message, title, options);
    }

    warning(message: string, title?: string, options: ToastOptions = defaultOpts): Toast {
        return this.toast(ToastType.Warning, message, title, options);
    }

    info(message: string, title?: string, options: ToastOptions = defaultOpts): Toast {
        return this.toast(ToastType.Info, message, title, options);
    }

    success(message: string, title?: string, options: ToastOptions = defaultOpts): Toast {
        return this.toast(ToastType.Success, message, title, options);
    }

    observeToasts(): Observable<Toast> {
        return this._toastSubject;
    }
    
}
