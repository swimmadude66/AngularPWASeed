import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {SubscriberComponent, PasswordValidation, FormErrorParser} from '@core/index';
import {AuthService} from '@services/index';

@Component({
    selector: 'signup',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class SignupComponent extends SubscriberComponent {

    form: FormGroup;
    error: string;

    formControls = {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
        confirmPassword: new FormControl('', [Validators.required])
    };

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _auth: AuthService
    ) {
        super();
        this.form = _fb.group(this.formControls,
        {
            validator: PasswordValidation.matchPassword
        });
    }

    signup(): void {
        this.error = null;
        if (!this.form.valid) {
            return;
        }
        this.addSubscription(
            this._auth.signup(this.form.get('email').value, this.form.get('password').value)
            .subscribe(
                _ => {
                    this.form.reset();
                    this._router.navigate(['/']);
                },
                err => this.error = 'Could not signup at this time'
            )
        );

    }

}
