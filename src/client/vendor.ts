// Dependencies
import 'reflect-metadata/Reflect';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';

// Angular
import '@angular/core';
import '@angular/common';
import '@angular/compiler';
import '@angular/common/http';
import '@angular/forms';
import '@angular/router';
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';

// rxjs
import {Observable, Subscription, Subject} from 'rxjs';
import {map, flatMap, take, combineLatest, tap} from 'rxjs/operators';
