import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from '@modules/app';
import {env} from './environments/environment';

let opts: any = {};
if (env.isProdMode) {
    enableProdMode();
    opts.preserveWhitespaces = false;
}
document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic().bootstrapModule(AppModule, opts)
    .catch(err => console.log(err));
});
