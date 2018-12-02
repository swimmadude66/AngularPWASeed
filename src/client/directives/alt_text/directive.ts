import { Directive, HostBinding, Attribute } from '@angular/core';

@Directive({
    selector: 'img'
})
  export class AltTextDirective {
    @HostBinding('alt') @Attribute('alt') alt: string = ' ';
}
