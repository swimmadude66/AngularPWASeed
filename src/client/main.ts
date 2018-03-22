import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './modules/app';
import {Environment} from './environment/environment';

let opts: any = {};
if (Environment.production) {
    enableProdMode();
    opts.preserveWhitespaces = false;
}
platformBrowserDynamic().bootstrapModule(AppModule, opts);
