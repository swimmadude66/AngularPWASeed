import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class WebviewService {

    constructor(
    ) { }

    isWebview(): boolean {
        if (/inwebview=1/i.test(document.location.search)) { // check manual flag for override
            return true;
        }
        
        if (window && window['Android']) { // Android with JavascriptInterface enabled
            return true;
        }
        
        const userAgent = navigator.userAgent;
        if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent)) { // ios webview
            return true;
        }

        if (/Android\s+[0-9]+\.[0-9]+/i.test(userAgent)) { // Android, chrome or webview
            if (/\s+wv\)/i.test(userAgent)) { // Android >= Lollipop wv
                return true;
            }

            if (/Version\/[0-9]+\.[0-9]+/i.test(userAgent)) { // Android <= KitKat
                return true;
            }

        }
        return false;
        // return this._cache.cacheRequest(
        //     `is_webview`,
        //     this._http.get<boolean>('/api/config/webview'),
        // );
    }
}
