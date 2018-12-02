import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'floor',
    pure: true
})
export class FloorNumberPipe implements PipeTransform {
 
    transform(input: number | string) {
        const val = +input;
        if (isNaN(val)) {
            return input;
        }
        return Math.floor(val);
    }
}
