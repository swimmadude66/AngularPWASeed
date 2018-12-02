import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'shorten',
    pure: true
})
export class ShortenTextPipe implements PipeTransform {
 
    transform(text: string, softLimit: number = 200) {
        if (text.length <= softLimit) {
            return text;
        } else if (text.length <= softLimit + 3) { // how long it will be with ... appended
            return text;
        } else {
            return  `${text.substring(0, softLimit)}...`;
        }
    }
}
