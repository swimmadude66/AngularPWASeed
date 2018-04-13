
export class FormErrorParser {

    static parseErrors(inputName: string, errors: {[key: string]: boolean}): string {
        if (errors['required']) {
            return `${inputName} is a required field`;
        } else if (errors['email']) {
            return `${inputName} must be a valid email address`;
        } else if (errors['passwordLength']) {
            return `${inputName} must be at least 8 characters`;
        } else if (errors['matchPassword']) {
            return `passwords do not match`;
        } else {
            console.log(Object.keys(errors).filter(k => errors[k]).join(', '));
            return `${inputName} is invalid`;
        }
    }
}
