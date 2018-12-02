import {AbstractControl} from '@angular/forms';

export const phonePattern: RegExp = /((\([0-9]{3}\))|([0-9]{3}))[ \.\-]?[0-9]{3}[ \.\-]?[0-9]{4}/;

export class PhoneValidation {

    static maskFormat() {
        return (control: AbstractControl) => {
            const phoneNumber = control.value;
            const errors = {};
            if(!phoneNumber) {
                return null;
            }
            if (!phonePattern.test(phoneNumber)) {
                errors['phoneFormat'] = true;
                return errors;
            } else {
              return null;
            }
        };
    }
}
