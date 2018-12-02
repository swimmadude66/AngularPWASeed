import {minAge} from '@core/forms/validators/date';

export class FormErrorParser {

    static parseErrors(inputName: string, errors: {[key: string]: boolean}): string {
        if (errors.required) {
            return `${inputName} is required`;
        } else if (errors.email) {
            return `${inputName} must be a valid email address`;
        } else if (errors.phoneFormat) {
            return `Not a valid phone number`;
        } else if (errors.dateFormat) {
            return `Invalid date format`;
        } else if (errors.validDate) {
            return `Invalid date`;
        } else if (errors.validBirthDate) {
            return `Invalid date of birth`;
        } else if (errors.tooYoung) {
            return `Must be at least ${minAge} years old`;
        } else if (errors.matchPassword) {
            return `Passwords do not match`;
        } else if (errors.passwordSpaces) { 
            // return 'Password must not contain whitespace';
            return 'Not a valid password';
        } else if (errors.passwordLength){
            // return 'Password must be at least 8 chars';
            return 'Not a valid password';
        } else if (errors.passwordUppercase){
            // return 'Password must contain an uppercase letter';
            return 'Not a valid password';
        } else if (errors.passwordNumbers){
            // return 'Password must contain a number';
            return 'Not a valid password';
        } else if (errors.passwordLowercase){
            // return 'Password must contain a lowercase letter';
            return 'Not a valid password';
        } else if (errors.passwordSymbols){
            // return 'Password must contain a symbol';
            return 'Not a valid password';
        } else if (errors.passwordComplexity) { 
            return 'Not a valid password';
        } else if (errors.minValue){
            return 'Amount is too small';
        } else {
            console.log(Object.keys(errors).filter(k => errors[k]).join(', '));
            return `${inputName} is invalid`;
        }
    }
}




