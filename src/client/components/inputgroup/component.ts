import {Component, Input, ViewChild, ElementRef, forwardRef} from '@angular/core';
import {FormErrorParser} from '@core/';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export const INPUT_GROUP_VALUE_ACCESSOR : any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputGroupComponent),
    multi: true,
};
  
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
    @Input('errors') errors?: {[key: string]: boolean};
    @Input('placeholder') placeholder?: string = '';
    @Input('autocomplete') autocomplete?: string = 'none';

    @ViewChild('input') set input(i: ElementRef) {
        this.inputElement = i.nativeElement as HTMLInputElement;
    }
    
    pristine: boolean = true;
    blurred: boolean = false;
    hasError: boolean = false;
    disabled: boolean = false;
    inputElement: HTMLInputElement;
    
    private _onChange: Function; 
    private _onTouch: Function; 

    writeValue(obj: any): void {
        this.inputElement.value = obj;
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
        if (this._onChange) {
            this._onChange(this.inputElement.value);
            this.hasError = this.errors && Object.keys(this.errors).length > 0;
        }
    }

    onTouch(event) {
        if (this._onTouch) {
            this._onTouch();
        }
    }

    onBlur() {
        if (!this.blurred) {
            this.blurred = true;
        }
    }

    getError(): string {
        if (!!this.errors){
            return FormErrorParser.parseErrors(this.label, this.errors);
        }
    }
}
