import {AbstractControl} from '@angular/forms';

export const datePattern: RegExp = /((0[1-9])|(1[0-2]))([\.\-\/\\ ])?((0[1-9])|([12][0-9])|(3[01]))([\.\-\/\\ ])?([0-9]{4})/;
export const minAge = 18;
export class DateValidation {

    static maskFormat() {
        return (control: AbstractControl) => {
            const dob = control.value;
            const errors = {};
            if(!dob) {
                return null;
            }
            if (!datePattern.test(dob)) {
                errors['dateFormat'] = true;
                return errors;
            } else {
                const formatted = dob.replace(datePattern, '$1/$5/$10');
                const realDate = new Date(formatted);
                const realMonth = ((realDate.getMonth()+1)+'').replace(/^(\d)$/, '0$1');
                const realDay = (realDate.getDate()+'').replace(/^(\d)$/, '0$1');
                const realYear = (realDate.getFullYear()+'');
                if (`${realMonth}/${realDay}/${realYear}` !== formatted) {
                    errors['validDate'] = true;
                    return errors;
                } else {
                    return null;
                }
            }
        };
    }

    static validDob() {
        return (control: AbstractControl) => {
            const dob = control.value;
            const errors = {};
            if(!dob) {
                return null;
            }
            if (!datePattern.test(dob)) {
                errors['dateFormat'] = true;
                return errors;
            } else {
                const formatted = dob.replace(datePattern, '$1/$5/$10');
                const realDate = new Date(formatted);
                const realMonth = ((realDate.getMonth()+1)+'').replace(/^(\d)$/, '0$1');
                const realDay = (realDate.getDate()+'').replace(/^(\d)$/, '0$1');
                const realYear = (realDate.getFullYear()+'');
                const comp = `${realMonth}/${realDay}/${realYear}`;
                if (comp !== formatted) {
                    errors['validDate'] = true;
                    return errors;
                } else if (realDate.getFullYear() < 1900) { 
                    errors['validBirthDate'] = true;
                    return errors;
                } else {
                    const now = new Date();
                    const todayAgo = new Date(`${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()-minAge}`);
                    if(realDate.valueOf() > todayAgo.valueOf()) {
                        errors['tooYoung'] = true;
                        return errors;
                    } else {
                        return null;
                    }
                }
            }
        };
    }
}
