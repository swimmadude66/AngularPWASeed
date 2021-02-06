import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {SubscriberComponent} from '@core';
import {AuthService} from '@services';

@Component({
    selector: 'login',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class LoginComponent extends SubscriberComponent {

    form: FormGroup;
    serverError: string;

    formControls = {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required])
    };

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _auth: AuthService
    ) {
        super();
        this.form = _fb.group(this.formControls);
    }

    login(): void {
        this.serverError = null;
        if (!this.form.valid) {
            return;
        }
        this.addSubscription(
            this._auth.login(this.form.get('email').value, this.form.get('password').value)
            .subscribe(
                _ => {
                    this.form.reset();
                    this._router.navigate(['/']);
                },
                err => this.serverError = 'Could not login at this time'
            )
        );

    }

}
