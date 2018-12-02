import { Injectable } from '@angular/core';
import { StorageLocation } from '@models/shared/storage';

@Injectable({
    providedIn: 'root'
})
export class BrowserStorageService {

    private _supportsLocal: boolean;
    private _supportsSession: boolean;
    private _inMem = {};

    // determine if browser supports local and session storage, fallback to inMem
    constructor() {
        try {
            localStorage.setItem('_bs_testLocal', 'stored');
            const loc = localStorage.getItem('_bs_testLocal');
            localStorage.removeItem('_bs_testLocal');
            if (loc === 'stored') {
                this._supportsLocal = true;
            } else {
                this._supportsLocal = false;
            }
        } catch(e) {
            this._supportsLocal = false;
        }

        try {
            sessionStorage.setItem('_bs_testSession', 'stored');
            const loc = sessionStorage.getItem('_bs_testSession');
            sessionStorage.removeItem('_bs_testSession');
            if (loc === 'stored') {
                this._supportsSession = true;
            } else {
                this._supportsSession = false;
            }
        } catch(e) {
            this._supportsSession = false;
        }
    }

    setItem(key: string, value: string, locations: StorageLocation[] = ['local', 'session', 'memory']) {
        for (let i=0; i < locations.length; i++) {
            const loc = locations[i];
            if (loc === 'local' && this._supportsLocal) {
                this.setLocal(key, value);
                break;
            } else if (loc === 'session' && this._supportsSession) {
                this.setSession(key, value);
                break;
            } else if (loc === 'memory') {
                this.setInMem(key, value);
                break;
            }
        }
    }

    getItem(key: string, locations: StorageLocation[] = ['local', 'session', 'memory']): string {
        for (let i=0; i < locations.length; i++) {
            const loc = locations[i];
            let val;
            if (loc === 'local' && this._supportsLocal) {
                val = this.getLocal(key);
            } else if (loc === 'session' && this._supportsSession) {
                val = this.getSession(key);
            } else if (loc === 'memory') {
                val = this.getInMem(key);
            }
            if (typeof val !== 'undefined' && val !== null) { // check if we found it
                return val;
            }
        }
    }

    removeItem(key: string, locations: StorageLocation[] = ['local', 'session', 'memory']) {
        for (let i=0; i < locations.length; i++) {
            const loc = locations[i];
            if (loc === 'local' && this._supportsLocal) {
                this.removeLocal(key);
            } else if (loc === 'session' && this._supportsSession) {
                this.removeSession(key);
            } else if (loc === 'memory') {
                this.removeInMem(key);
            }
        }
    }

    clearStorage() {
        if (this._supportsLocal) {
            localStorage.clear();
        }
        if (this._supportsSession) {
            sessionStorage.clear();
        }
        this._inMem = {};
    }

    setLocal(key: string, value: string) {
        if (this._supportsLocal) {
            localStorage.setItem(key, value);
        }
    }

    getLocal(key: string): string {
        if (this._supportsLocal) {
            return localStorage.getItem(key);
        }
    }

    removeLocal(key: string) {
        if (this._supportsLocal) {
            localStorage.removeItem(key);
        }
    }

    clearLocal() {
        if (this._supportsLocal) {
            localStorage.clear();
        }
    }

    setSession(key: string, value: string) {
        if (this._supportsSession) {
            sessionStorage.setItem(key, value);
        }
    }

    getSession(key: string): string {
        if (this._supportsSession) {
            return sessionStorage.getItem(key);
        }
    }

    removeSession(key: string) {
        if (this._supportsSession) {
            sessionStorage.removeItem(key);
        }
    }

    clearSession() {
        if (this._supportsSession) {
            sessionStorage.clear();
        }
    }

    setInMem(key: string, value: string) {
        this._inMem[key] = value;
    }

    getInMem(key: string): string {
        return this._inMem[key];
    }

    removeInMem(key: string) {
        delete this._inMem[key];
    }

    clearInMem() {
        this._inMem = {};
    }

}
