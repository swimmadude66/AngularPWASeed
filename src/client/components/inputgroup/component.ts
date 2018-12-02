import {Component, Output, ViewChild, ElementRef, forwardRef, EventEmitter, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, AbstractControl} from '@angular/forms';
import {FormErrorParser} from '@core/index';
import {MaskService} from '@services/index';

export const INPUT_GROUP_VALUE_ACCESSOR : any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputGroupComponent),
    multi: true
};
  
type MASK = 'CURRENCY' | 'DATE' | 'PHONE';

@Component({
    selector: 'input-group',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    providers: [INPUT_GROUP_VALUE_ACCESSOR]
})
export class InputGroupComponent implements ControlValueAccessor {
    @Input('id') id: string;
    @Input('type') type: string;
    @Input('label') label: string;
    @Input('name') name: string;
    @Input('formControl') control: AbstractControl;
    @Input('placeholder') placeholder?: string = '';
    @Input('autocomplete') autocomplete?: string = 'none';
    @Input('maxLength') maxLength?: number = 999;
    @Input('passwordButton') passwordButton?: boolean = false;
    @Input('showRequirements') showRequirements: boolean = false;
    @Input('mask') set mask(m: MASK) {
        this._maskType = m;
        if (m) {
            if (m === 'PHONE') {
               this.maxLength = 14;
            } else if (m === 'DATE') {
               this.maxLength = 10;
            }
        }
    };

    @Output('onFocus') onFocus: EventEmitter<any> = new EventEmitter<any>();
    @Output('onBlur') onBlur: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('input') set input(i: ElementRef) {
        this.inputElement = i.nativeElement as HTMLInputElement;
    }

    get mask(): MASK {
        return this._maskType;
    }

    private _maskType: MASK;
    
    pristine: boolean = true;
    blurred: boolean = false;
    focused: boolean = false;
    hasError: boolean = false;
    disabled: boolean = false;
    pwdShown: boolean = false;
    inputElement: HTMLInputElement;

    get hasPasswordError(): boolean {
        const err =  this.control.errors;
        return err && (err.passwordLength
            || err.passwordUppercase
            || err.passwordNumbers
            || err.passwordLowercase
            || err.passwordSymbols
            || err.passwordComplexity);
    }
    
    private _onChange: Function; 
    private _onTouch: Function;
    private _lastLength: number = 0;

    constructor(
        private _mask: MaskService
    ) {
    }

    writeValue(obj: string): void {
        if (obj && obj.length) {
            this.inputElement.value = obj;
            const value = this.maskValue(obj);
            if (value !== obj) {
                this.emitValue(value);
            }
        }
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouch = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onChange(event) {
        this.pristine = false;
        const value = this.inputElement.value;
        let outputValue = value;
        if (value && value.length > this._lastLength && this.inputElement.selectionStart && this.inputElement.selectionStart === value.length) { // only mask when cursor is at the end
            outputValue = this.maskValue(value);
        } else {
            this._lastLength = value.length;
        }
        this.emitValue(outputValue);
        
    }

    onTouch(event) {
        if (this._onTouch) {
            this._onTouch();
        }
    }

    blur(event) {
        if (!this.blurred) {
            this.blurred = true;
        }
        this.focused = false;
        if (this.inputElement.value && this.inputElement.value.length) {
            const blurMasked = this.maskValue(this.inputElement.value); // always mask on blur
            this.emitValue(blurMasked);
        }
        this.onBlur.emit(event); // emit blur event for extension
    }

    focus(event) {
        if (!this.focused) {
            this.focused = true;
        }
        this.blurred = false;
        this.onFocus.emit(event);
    }

    getError(): string {
        if (!!this.control.errors){
            return FormErrorParser.parseErrors(this.label, this.control.errors);
        }
    }

    togglePwdVis() {
        if (this.pwdShown) {
            this.type = 'password';
        } else {
            this.type = 'text';
        }
        this.pwdShown = !this.pwdShown;
    }

    maskValue(value: string): string {
        let masked: string = value;
        let changed = false;
        if (this.mask && this.mask.length) {
            // mask the input
            if (this.mask === 'PHONE') {
                masked = this._mask.maskPhone(value);
                changed = true;
            } else if (this.mask === 'DATE') {
                masked = this._mask.maskDate(value);
                changed = true;
            } else if (this.mask === 'CURRENCY') {
                masked = this._mask.maskCurrency(value);
                changed = true;
            }
            if (changed) {
                const caret = this.inputElement.selectionStart;
                const caretOffeset = value.length - caret; // number of chars from the end (since masking works on the beginning)
                const newCaret = (masked.length - caretOffeset);
                this.inputElement.value = masked; // set value to masked
                this.inputElement.selectionStart = newCaret; // refresh cursor position
                this.inputElement.selectionEnd = newCaret;
            }
        }
        this._lastLength = masked.length; // update length
        return masked;
    }

    emitValue(value: string) {
        if (this._onChange) {
            this._onChange(value);
            this.hasError = this.control.errors && Object.keys(this.control.errors).length > 0;
        }
    }
}
