import {AbstractControl} from '@angular/forms';

export class PasswordValidation {

    static matchPassword(AC: AbstractControl) {
       const passwordControl = AC.get('password');
       const confirmPasswordControl = AC.get('confirmPassword');
        if(passwordControl.value !== confirmPasswordControl.value) {
            confirmPasswordControl.setErrors({matchPassword: true});
        } else {
            return null;
        }
    }

    static passwordLength(AC: AbstractControl) {
        const passwordControl = AC.get('password');
        if (passwordControl.value.length < 8) {
            passwordControl.setErrors({passwordLength: true});
        } else {
            return null;
        }
    }
}
