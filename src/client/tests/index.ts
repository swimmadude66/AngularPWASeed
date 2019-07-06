// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'core-js';
import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import 'zone.js/dist/mocha-patch';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '@modules/shared';

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare var __karma__: any;
declare var require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = function () {};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    [
        BrowserDynamicTestingModule,
        RouterTestingModule,
        HttpClientTestingModule,
        SharedModule
    ],
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);

const componentContext = require.context('../components', true, /\.ts$/);
componentContext.keys().forEach(componentContext);

const servicesContext = require.context('../services', true, /\.ts$/);
servicesContext.keys().forEach(servicesContext);

const pipesContext = require.context('../pipes', true, /\.ts$/);
pipesContext.keys().forEach(pipesContext);

__karma__.start();
