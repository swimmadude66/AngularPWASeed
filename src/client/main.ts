import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from '@modules/app';
import {env} from './environments/environment';

// required libs for angular
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'reflect-metadata/Reflect';

let opts: any = {};
if (env.isProdMode) {
    enableProdMode();
    opts.preserveWhitespaces = false;
}
document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic().bootstrapModule(AppModule, opts)
    .catch(err => console.log(err));
});
