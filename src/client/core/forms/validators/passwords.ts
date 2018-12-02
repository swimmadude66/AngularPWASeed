import {AbstractControl} from '@angular/forms';

export class PasswordValidation {

    static matchPassword(pwdField: string, confirmField: string) {
        return (control: AbstractControl) => {
            const password = control.get(pwdField).value;
            const confirmPassword = control.get(confirmField).value;
            if (password !== confirmPassword) {
              control.get(confirmField).setErrors({ matchPassword: true });
            } else {
              return null;
            }
        };
    }

    static passwordComplexity() {
        return (control: AbstractControl) => {
            const password = control.value;
            if(!password) {
                return null;
            }
            const errors = {};
            let hasError = false;
            if (!password || password.length < 8 ) { // password is null or less than 8 chars
                errors['passwordLength'] = true;
                hasError = true;
            } 
            if ((/\s/.test(password))) { // password contains whitespace
                errors['passwordSpaces'] = true;
                hasError = true;
            }
            if (!(/[A-Z]/.test(password))) { // password does not contain an uppercase letter
                errors['passwordUppercase'] = true;
                hasError = true;
            }
            if(!(/[0-9]/.test(password))) { // password does not contain a number
                errors['passwordNumbers'] = true;
                hasError = true;
            }
            if(!(/[a-z]/.test(password))) { // password does not contain a lower case letter
                errors['passwordLowercase'] = true;
                hasError = true;
            }
            if(!(/[^a-zA-Z0-9]/.test(password))) { // password does not contain a symbol
                errors['passwordSymbols'] = true;
                hasError = true;
            }
            if (hasError) {
                errors['passwordComplexity'] = true;
                return errors; // then it is not complex enough
            } else {
              return null;
            }
        };
    }
}
