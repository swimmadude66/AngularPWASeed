import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'reflect-metadata/Reflect';

// Angular
import '@angular/core';
import '@angular/common';
import '@angular/common/http';
import '@angular/forms';
import '@angular/router';

// rxjs
import { Observable, Subscription, Subject, of, combineLatest, throwError, from, fromEvent } from 'rxjs';
import { map, flatMap, switchMap, take, first, skip, tap, finalize, timeout, catchError, debounceTime, throttleTime, filter } from 'rxjs/operators';
