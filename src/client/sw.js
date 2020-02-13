import {skipWaiting, clientsClaim} from 'workbox-core';
import {precacheAndRoute, createHandlerBoundToURL} from 'workbox-precaching';
import {NavigationRoute, registerRoute, setCatchHandler} from 'workbox-routing';
import {NetworkOnly, NetworkFirst, StaleWhileRevalidate, CacheFirst} from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {ExpirationPlugin} from 'workbox-expiration';

skipWaiting();
clientsClaim();

const noCorsPlugin = {
    requestWillFetch: ({event, request}) => {
        return new Request(request, {mode: 'no-cors'});
    }
};

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    new NavigationRoute(
        createHandlerBoundToURL('index.html')
    )
); // always serve index, just like when the internet is live
    
registerRoute(
    /^http:\/\/localhost(:[0-9]+)?\/browser-sync\//i,
    new NetworkOnly(),
    'GET'
);

registerRoute(
    /\/(admin\/)?api\//i,
    new NetworkFirst({ 
        networkTimeoutSeconds: 5, 
        cacheName: 'api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200]
            }),
        ]
    }), 
    'GET'
);

registerRoute(
    /\/[0-9]+\..*?\.min\.js$/i, 
    new NetworkFirst({ 
        networkTimeoutSeconds: 5, 
        cacheName: 'bundle-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200]
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // Will refetch on page load
            })
        ]
    }), 
    'GET'
);

registerRoute(
    /\/assets\//i, 
    new StaleWhileRevalidate({ 
        cacheName: 'asset-cache', 
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // they are images, get rid of them for more important stuff
            })
        ] 
    }), 
    'GET'
);

registerRoute(
    /\/fonts\//i, 
    new StaleWhileRevalidate({ 
        cacheName: 'font-cache', 
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // they are fonts, get rid of them for more important stuff
            })
        ] 
    }), 
    'GET'
);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
    /^https:\/\/fonts\.googleapis\.com/i,
    new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
    })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
/^https:\/\/fonts\.gstatic\.com/i,
    new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
            }),
        ],
    })
);


// Catch-all for GETs to external resources to not make CORS requests
registerRoute(
    /^http.*/i,
    new NetworkOnly({
        plugins: [
            noCorsPlugin
        ],
    }),
    'GET'
);

// This "catch" handler is triggered when any of the other routes throw an error
setCatchHandler(({url, event, params}) => {
    const request = event.request;

    switch (request.destination) {
        case 'document':
            return caches.match('index.html');
        case 'image':
            return caches.match('assets/images/empty.png');
        default:
            return Response.error();
    }
});
