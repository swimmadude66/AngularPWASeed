import { Directive, HostBinding, Attribute } from '@angular/core';

@Directive({
    selector: 'a[href]'
})
  export class ExternalLinkDirective {
    @HostBinding('rel') @Attribute('rel') rel: string = 'noopener';
    @HostBinding('target') @Attribute('target') target: string = '_blank';
}
