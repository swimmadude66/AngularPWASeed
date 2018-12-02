import {AbstractControl} from '@angular/forms';

export class LocationValidation {

    static validLocation() {
        return (control: AbstractControl) => {
            const loc = control.value;
            const errors = {};
            if(!loc || !loc.city || !loc.state || (!loc.zip && !(loc.lat && loc.lng))) {
                errors['fullLocation'] = true;
                return errors;
            } else {
                return null;
            }
        };
    }
}
